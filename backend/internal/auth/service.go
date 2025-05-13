package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"time"

	"github.com/andrelcunha/Concord/backend/pkg/models"
	"github.com/golang-jwt/jwt/v5"
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

func (s *Service) Login(ctx context.Context, username, password string) (string, string, error) {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return "", "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", "", errors.New("invalid credentials")
	}

	accesToken, err := s.generateAccesToken(user.Username, s.secret)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return "", "", err
	}

	if err := s.redis.Set(ctx, "refresh:"+user.Username, refreshToken, 24*time.Hour).Err(); err != nil {
		return "", "", err
	}

	return accesToken, refreshToken, nil
}

func (s *Service) Refresh(ctx context.Context, username, refreshToken string) (string, error) {
	// Check if the refresh token is valid
	storedToken, err := s.redis.Get(ctx, "refresh:"+username).Result()
	if err == redis.Nil || storedToken != refreshToken {
		return "", errors.New("invalid refresh token")
	}

	// Generate a new access token
	accessToken, err := s.generateAccesToken(username, s.secret)
	if err != nil {
		return "", err
	}

	return accessToken, nil
}

func (s *Service) generateAccesToken(username, secret string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": username,
		"exp": time.Now().Add(15 * time.Minute).Unix(),
	})
	return token.SignedString([]byte(secret))
}

func (s *Service) generateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
