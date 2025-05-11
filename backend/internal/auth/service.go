package auth

import (
	"context"

	"github.com/andrelcunha/Concord/backend/config"
	"github.com/andrelcunha/Concord/backend/pkg/models"
	"github.com/redis/go-redis/v9"
)

type Repository interface {
	CreateUser(ctx context.Context, user *models.User) error
	GetUserByUsername(ctx context.Context, username string) (*models.User, error)
}

type Service struct {
	repo   Repository
	redis  *redis.Client
	secret string
}

func NewService(repo Repository, redis *redis.Client) *Service {
	// get secret from config
	secret := config.Config("SECRET")
	return &Service{
		repo:   repo,
		redis:  redis,
		secret: secret, // get this from config
	}
}
