package websocket

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
	db *db.Queries
}

type Repository interface {
	CreateMessage(ctx context.Context, channelID, userID int32, content, username string) (db.Message, error)
	ListMessagesByChannel(ctx context.Context, channelID, limit, offset int32) ([]db.Message, error)
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	db := db.New(dbPool)
	return &repository{
		db: db,
	}
}

func (r *repository) CreateMessage(ctx context.Context, channelID int32, userID int32, content, username string) (db.Message, error) {
	message, err := r.db.CreateMessage(ctx, db.CreateMessageParams{
		ChannelID: channelID,
		UserID:    userID,
		Content:   content,
		Username:  username,
	})
	if err != nil {
		return db.Message{}, err
	}
	return message, nil
}

func (r *repository) ListMessagesByChannel(ctx context.Context, channelID, limit, offset int32) ([]db.Message, error) {
	messages, err := r.db.ListMessagesByChannel(ctx, db.ListMessagesByChannelParams{
		ChannelID: channelID,
		Limit:     limit,
		Offset:    offset,
	})
	if err != nil {
		return nil, err
	}
	return messages, nil
}
