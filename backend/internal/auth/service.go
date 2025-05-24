package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"strconv"
	"time"

	"github.com/andrelcunha/Concord/backend/pkg/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/bcrypt"
)

const (
	AccessTokenTTL  = 15 * time.Minute
	RefreshTokenTTL = 7 * 24 * time.Hour
)

// Errors for specific failure cases
var (
	ErrInvalidCredentials  = errors.New("invalid credentials")
	ErrInvalidRefreshToken = errors.New("invalid refresh token")
	ErrExpiredRefreshToken = errors.New("expired refresh token")
)

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
	user, err = s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *Service) Login(ctx context.Context, username, password string) (string, string, error) {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return "", "", ErrInvalidCredentials
		}
		return "", "", ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", "", errors.New("invalid credentials")
	}

	accesToken, err := s.generateAccessToken(int32(user.UserId), user.Username)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return "", "", err
	}

	redisKey := "refresh_token:" + refreshToken
	err = s.redis.HSet(ctx, redisKey, map[string]interface{}{
		"user_id":    user.UserId,
		"username":   user.Username,
		"expires_at": time.Now().Add(RefreshTokenTTL).Format(time.RFC3339),
	}).Err()
	if err != nil {
		return "", "", err
	}
	s.redis.Expire(ctx, redisKey, RefreshTokenTTL)

	return accesToken, refreshToken, nil
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (string, string, error) {
	// Check Redis for refresh token
	redisKey := "refresh_token:" + refreshToken
	val, err := s.redis.HGetAll(ctx, redisKey).Result()
	if err == redis.Nil || len(val) == 0 {
		return "", "", ErrInvalidRefreshToken
	}

	// Parse expiration
	expiresAt, err := time.Parse(time.RFC3339, val["expires_at"])
	if err != nil {
		return "", "", err
	}
	if time.Now().After(expiresAt) {
		return "", "", ErrExpiredRefreshToken
	}

	// Extract username
	username := val["username"]
	if username == "" {
		return "", "", ErrInvalidRefreshToken
	}

	userIDStr := val["user_id"]
	if userIDStr == "" {
		return "", "", ErrInvalidRefreshToken
	}

	// Convert userID string to int32
	userID, err := strconv.ParseInt(userIDStr, 10, 32)
	if err != nil {
		return "", "", err
	}

	// Generate a new access token
	accessToken, err := s.generateAccessToken(int32(userID), username)
	if err != nil {
		return "", "", err
	}

	// Generate a new refresh token (rotation)
	newRefreshToken, err := s.generateRefreshToken()
	if err != nil {
		return "", "", err
	}

	// Store new refresh token in Redis
	newRedisKey := "refresh_token:" + newRefreshToken
	err = s.redis.HSet(ctx, newRedisKey, map[string]interface{}{
		"user_id":    userID,
		"username":   username,
		"expires_at": time.Now().Add(RefreshTokenTTL).Format(time.RFC3339),
	}).Err()
	if err != nil {
		return "", "", err
	}
	s.redis.Expire(ctx, newRedisKey, RefreshTokenTTL)

	// Delete old refresh token
	s.redis.Del(ctx, redisKey)

	return accessToken, newRefreshToken, nil
}

func (s *Service) generateAccessToken(userID int32, username string) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":      float64(userID),
		"username": username,
		"exp":      time.Now().Add(AccessTokenTTL).Unix(),
	})
	return token.SignedString([]byte(s.secret))
}

func (s *Service) generateRefreshToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
