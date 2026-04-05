package servers

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type repository struct {
	db   *db.Queries
	pool *pgxpool.Pool
}

type Repository interface {
	CreateServer(ctx context.Context, name string, userID int32, isPublic bool) (db.Server, error)
	CreateDefaultChannel(ctx context.Context, serverID, userID int32) error
	ListUserServers(ctx context.Context, userID int32) ([]db.Server, error)
	ListDiscoverableServers(ctx context.Context, userID int32, query string) ([]db.Server, error)
	IsServerMember(ctx context.Context, serverID, userID int32) (bool, error)
	JoinServer(ctx context.Context, serverID, userID int32) error
	GetServer(ctx context.Context, serverID int32) (db.Server, error)
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	db := db.New(dbPool)
	return &repository{db: db, pool: dbPool}
}

func (r *repository) CreateServer(ctx context.Context, name string, userID int32, isPublic bool) (db.Server, error) {
	arg := db.CreateServerParams{
		Name:      name,
		CreatorID: pgtype.Int4{Int32: userID, Valid: true},
		IsPublic:  pgtype.Bool{Bool: isPublic, Valid: true},
	}
	return r.db.CreateServer(ctx, arg)
}

func (r *repository) CreateDefaultChannel(ctx context.Context, serverID, userID int32) error {
	_, err := r.db.CreateChannel(ctx, db.CreateChannelParams{
		Name:      "general",
		CreatedBy: pgtype.Int4{Int32: userID, Valid: true},
		ServerID:  serverID,
	})
	return err
}

func (r *repository) ListUserServers(ctx context.Context, userID int32) ([]db.Server, error) {
	return r.db.ListUserServers(ctx, userID)
}

func (r *repository) ListDiscoverableServers(ctx context.Context, userID int32, query string) ([]db.Server, error) {
	const discoverServersQuery = `
SELECT s.id, s.name, s.creator_id, s.is_public, s.created_at
FROM servers s
LEFT JOIN server_members sm
  ON sm.server_id = s.id
 AND sm.user_id = $1
WHERE s.is_public = TRUE
  AND sm.user_id IS NULL
  AND ($2 = '' OR s.name ILIKE '%' || $2 || '%')
ORDER BY s.created_at ASC
`

	rows, err := r.pool.Query(ctx, discoverServersQuery, userID, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var servers []db.Server
	for rows.Next() {
		var server db.Server
		if err := rows.Scan(
			&server.ID,
			&server.Name,
			&server.CreatorID,
			&server.IsPublic,
			&server.CreatedAt,
		); err != nil {
			return nil, err
		}
		servers = append(servers, server)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return servers, nil
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
