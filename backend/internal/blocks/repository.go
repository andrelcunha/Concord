package blocks

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	CreateBlock(ctx context.Context, blockerID, blockedID int32) (db.Block, error)
	DeleteBlock(ctx context.Context, blockerID, blockedID int32) error
	GetBlock(ctx context.Context, blockerID, blockedID int32) (db.Block, error)
	ListBlockedUsers(ctx context.Context, blockerID int32) ([]db.ListBlockedUsersRow, error)
}

type repository struct {
	db *db.Queries
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	return &repository{
		db: db.New(dbPool),
	}
}

func (r *repository) CreateBlock(ctx context.Context, blockerID, blockedID int32) (db.Block, error) {
	return r.db.CreateBlock(ctx, db.CreateBlockParams{
		BlockerID: blockerID,
		BlockedID: blockedID,
	})
}

func (r *repository) DeleteBlock(ctx context.Context, blockerID, blockedID int32) error {
	return r.db.DeleteBlock(ctx, db.DeleteBlockParams{
		BlockerID: blockerID,
		BlockedID: blockedID,
	})
}

func (r *repository) GetBlock(ctx context.Context, blockerID, blockedID int32) (db.Block, error) {
	return r.db.GetBlock(ctx, db.GetBlockParams{
		BlockerID: blockerID,
		BlockedID: blockedID,
	})
}

func (r *repository) ListBlockedUsers(ctx context.Context, blockerID int32) ([]db.ListBlockedUsersRow, error) {
	return r.db.ListBlockedUsers(ctx, blockerID)
}
