package auth

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/andrelcunha/Concord/backend/pkg/models"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	CreateUser(ctx context.Context, user *models.User) error
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
}

type repository struct {
	db *db.Queries
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	db := db.New(dbPool)
	return &repository{
		db: db,
	}
}

func (r *repository) CreateUser(ctx context.Context, user *models.User) error {
	return r.db.CreateUser(ctx, db.CreateUserParams{
		Username: user.Username,
		Password: user.Password,
	})
}

func (r *repository) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	user, err := r.db.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	return &models.User{
		Username: user.Username,
		Password: user.Password,
	}, nil
}
