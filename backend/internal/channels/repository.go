package channels

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
	db *db.Queries
}

type Repository interface {
	CreateChannel(ctx context.Context, name string, userID, serverID int32) (db.CreateChannelRow, error)
	ListChannels(ctx context.Context, serverID int32) ([]db.ListChannelsRow, error)
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	db := db.New(dbPool)
	return &repository{
		db: db,
	}
}

// Implement CreateChannel method
func (r *repository) CreateChannel(ctx context.Context, name string, userID, serverId int32) (db.CreateChannelRow, error) {
	arg := db.CreateChannelParams{
		Name:      name,
		CreatedBy: pgtype.Int4{Int32: userID, Valid: true},
		ServerID:  serverId,
	}
	return r.db.CreateChannel(ctx, arg)
}

// Implement ListChannels method
func (r *repository) ListChannels(ctx context.Context, serverID int32) ([]db.ListChannelsRow, error) {
	return r.db.ListChannels(ctx, serverID)
}
