package auth

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/andrelcunha/Concord/backend/pkg/dtos"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	CreateUser(ctx context.Context, user *dtos.UserDto) (*dtos.UserDto, error)
	GetUserByUsername(ctx context.Context, username string) (*dtos.UserDto, error)

	GetUserByID(ctx context.Context, userID int32) (*dtos.UserDto, error)
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

func (r *repository) CreateUser(ctx context.Context, user *dtos.UserDto) (*dtos.UserDto, error) {
	userDb, err := r.db.CreateUser(ctx, db.CreateUserParams{
		Username:    user.Username,
		Password:    user.Password,
		AvatarColor: pgtype.Text{String: user.AvatarColor, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	return &dtos.UserDto{
		UserId:      userDb.ID,
		Username:    userDb.Username,
		AvatarUrl:   userDb.AvatarUrl.String,
		AvatarColor: userDb.AvatarColor.String,
	}, nil
}

func (r *repository) GetUserByID(ctx context.Context, userID int32) (*dtos.UserDto, error) {
	userDb, err := r.db.GetUserByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	return &dtos.UserDto{
		UserId:      userDb.ID,
		Username:    userDb.Username,
		AvatarUrl:   userDb.AvatarUrl.String,
		AvatarColor: userDb.AvatarColor.String,
	}, nil
}

func (r *repository) GetUserByUsername(ctx context.Context, username string) (*dtos.UserDto, error) {
	user, err := r.db.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	return &dtos.UserDto{
		UserId:   user.ID,
		Username: user.Username,
		Password: user.Password,
	}, nil
}
