package auth

import (
	"context"
	"errors"

	"github.com/andrelcunha/Concord/backend/pkg/models"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
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

func NewService(repo Repository, redis *redis.Client, secret string) *Service {
	return &Service{
		repo:   repo,
		redis:  redis,
		secret: secret,
	}
}

func (s *Service) Register(ctx context.Context, username, password string) (*models.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		Username: username,
		Password: string(hashedPassword),
	}
	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) Login(ctx context.Context, username, password string) (string, error) {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", errors.New("invalid credentials")
	}

	token, err := generateToken(user.Username, s.secret)
	if err != nil {
		return "", err
	}

	return token, nil
}

func generateToken(username, secret string) (string, error) {
	// Implement JWT token generation logic here
	return "jwt-token-placeholder", nil
}
