package dms

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	GetDmConversationByUserPair(ctx context.Context, userID, otherUserID int32) (db.DmConversation, error)
	CreateConversationWithParticipants(ctx context.Context, firstUserID, secondUserID int32) (db.DmConversation, error)
	GetDmConversationForUser(ctx context.Context, conversationID, userID int32) (db.GetDmConversationForUserRow, error)
	GetDmConversationParticipant(ctx context.Context, conversationID, userID int32) (db.DmConversationParticipant, error)
	ListVisibleDmConversationsForUser(ctx context.Context, userID int32) ([]db.ListVisibleDmConversationsForUserRow, error)
	HideDmConversationForUser(ctx context.Context, conversationID, userID int32) error
	UnhideDmConversationForUser(ctx context.Context, conversationID, userID int32) error
	ListDmMessagesByConversation(ctx context.Context, conversationID, limit, offset int32) ([]db.ListDmMessagesByConversationRow, error)
	CreateDmMessage(ctx context.Context, conversationID, userID int32, content string) (db.DmMessage, error)
}

type repository struct {
	pool *pgxpool.Pool
	db   *db.Queries
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	return &repository{
		pool: dbPool,
		db:   db.New(dbPool),
	}
}

func (r *repository) GetDmConversationByUserPair(ctx context.Context, userID, otherUserID int32) (db.DmConversation, error) {
	return r.db.GetDmConversationByUserPair(ctx, db.GetDmConversationByUserPairParams{
		UserID:   userID,
		UserID_2: otherUserID,
	})
}

func (r *repository) CreateConversationWithParticipants(ctx context.Context, firstUserID, secondUserID int32) (db.DmConversation, error) {
	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return db.DmConversation{}, err
	}

	queries := db.New(tx)
	conversation, err := queries.CreateDmConversation(ctx)
	if err != nil {
		tx.Rollback(ctx)
		return db.DmConversation{}, err
	}

	if _, err := queries.AddDmConversationParticipant(ctx, db.AddDmConversationParticipantParams{
		ConversationID: conversation.ID,
		UserID:         firstUserID,
	}); err != nil {
		tx.Rollback(ctx)
		return db.DmConversation{}, err
	}

	if _, err := queries.AddDmConversationParticipant(ctx, db.AddDmConversationParticipantParams{
		ConversationID: conversation.ID,
		UserID:         secondUserID,
	}); err != nil {
		tx.Rollback(ctx)
		return db.DmConversation{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return db.DmConversation{}, err
	}

	return conversation, nil
}

func (r *repository) GetDmConversationForUser(ctx context.Context, conversationID, userID int32) (db.GetDmConversationForUserRow, error) {
	return r.db.GetDmConversationForUser(ctx, db.GetDmConversationForUserParams{
		ID:     conversationID,
		UserID: userID,
	})
}

func (r *repository) GetDmConversationParticipant(ctx context.Context, conversationID, userID int32) (db.DmConversationParticipant, error) {
	return r.db.GetDmConversationParticipant(ctx, db.GetDmConversationParticipantParams{
		ConversationID: conversationID,
		UserID:         userID,
	})
}

func (r *repository) ListVisibleDmConversationsForUser(ctx context.Context, userID int32) ([]db.ListVisibleDmConversationsForUserRow, error) {
	return r.db.ListVisibleDmConversationsForUser(ctx, userID)
}

func (r *repository) HideDmConversationForUser(ctx context.Context, conversationID, userID int32) error {
	_, err := r.db.HideDmConversationForUser(ctx, db.HideDmConversationForUserParams{
		ConversationID: conversationID,
		UserID:         userID,
	})
	return err
}

func (r *repository) UnhideDmConversationForUser(ctx context.Context, conversationID, userID int32) error {
	_, err := r.db.UnhideDmConversationForUser(ctx, db.UnhideDmConversationForUserParams{
		ConversationID: conversationID,
		UserID:         userID,
	})
	return err
}

func (r *repository) ListDmMessagesByConversation(ctx context.Context, conversationID, limit, offset int32) ([]db.ListDmMessagesByConversationRow, error) {
	return r.db.ListDmMessagesByConversation(ctx, db.ListDmMessagesByConversationParams{
		ConversationID: conversationID,
		Limit:          limit,
		Offset:         offset,
	})
}

func (r *repository) CreateDmMessage(ctx context.Context, conversationID, userID int32, content string) (db.DmMessage, error) {
	return r.db.CreateDmMessage(ctx, db.CreateDmMessageParams{
		ConversationID: conversationID,
		UserID:         userID,
		Content:        content,
	})
}
