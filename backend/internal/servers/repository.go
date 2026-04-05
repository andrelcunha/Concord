package servers

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
	CreateServer(ctx context.Context, name string, userID int32, isPublic bool) (db.Server, error)
	ListUserServers(ctx context.Context, userID int32) ([]db.Server, error)
	IsServerMember(ctx context.Context, serverID, userID int32) (bool, error)
	JoinServer(ctx context.Context, serverID, userID int32) error
	GetServer(ctx context.Context, serverID int32) (db.Server, error)
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	db := db.New(dbPool)
	return &repository{db: db}
}

func (r *repository) CreateServer(ctx context.Context, name string, userID int32, isPublic bool) (db.Server, error) {
	arg := db.CreateServerParams{
		Name:      name,
		CreatorID: pgtype.Int4{Int32: userID, Valid: true},
		IsPublic:  pgtype.Bool{Bool: isPublic, Valid: true},
	}
	return r.db.CreateServer(ctx, arg)
}

func (r *repository) ListUserServers(ctx context.Context, userID int32) ([]db.Server, error) {
	return r.db.ListUserServers(ctx, userID)
}

func (r *repository) IsServerMember(ctx context.Context, serverID, userID int32) (bool, error) {
	return r.db.IsServerMember(ctx, db.IsServerMemberParams{
		ServerID: serverID,
		UserID:   userID,
	})
}

func (r *repository) JoinServer(ctx context.Context, serverID, userID int32) error {
	return r.db.JoinServer(ctx, db.JoinServerParams{
		ServerID: serverID,
		UserID:   userID,
	})
}

func (r *repository) GetServer(ctx context.Context, serverID int32) (db.Server, error) {
	return r.db.GetServer(ctx, serverID)
}
