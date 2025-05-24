package messages

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
	db *db.Queries
}

type Repository interface {
	ListMessagesByChannel(ctx context.Context, channelID, limit, offset int32) ([]db.Message, error)
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	db := db.New(dbPool)
	return &repository{
		db: db,
	}
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
