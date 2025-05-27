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
	CreateChannel(ctx context.Context, name string, userID int64) (db.Channel, error)
	ListChannels(ctx context.Context) ([]db.Channel, error)
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	db := db.New(dbPool)
	return &repository{
		db: db,
	}
}

// Implement CreateChannel method
func (r *repository) CreateChannel(ctx context.Context, name string, userID int64) (db.Channel, error) {
	userIDPg := pgtype.Int4{Int32: int32(userID), Valid: true}
	return r.db.CreateChannel(ctx, db.CreateChannelParams{Name: name, CreatedBy: userIDPg})
}

// Implement ListChannels method
func (r *repository) ListChannels(ctx context.Context) ([]db.Channel, error) {
	return r.db.ListChannels(ctx)
}
