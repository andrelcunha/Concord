package auth

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"log"
	mathrand "math/rand"
	"strconv"
	"time"

	"github.com/andrelcunha/Concord/backend/pkg/dtos"
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

func (s *Service) Register(ctx context.Context, username, password string) (*dtos.UserDto, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &dtos.UserDto{
		Username:    username,
		Password:    string(hashedPassword),
		AvatarColor: getRandomColor(),
	}
	newUser, err := s.repo.CreateUser(ctx, user)
	if err != nil {
		return nil, err
	}

	return newUser, nil
}

func (s *Service) Login(ctx context.Context, username, password string) (string, string, error) {
	userID, ok, err := authUser(ctx, s, username, password)
	if !ok {
		return "", "", err
	}
	user, err := s.repo.GetUserByID(ctx, userID)
	if err != nil {
		return "", "", err
	}

	accesToken, err := s.generateAccessToken(user)
	if err != nil {
		return "", "", err
	}

	refreshToken, err := s.generateRefreshToken()
	if err != nil {
		return "", "", err
	}

	redisKey := "refresh_token:" + refreshToken
	err = s.redis.HSet(ctx, redisKey, map[string]interface{}{
		"user_id":      user.UserId,
		"username":     user.Username,
		"avatar_url":   user.AvatarUrl,
		"avatar_color": user.AvatarColor,
		"expires_at":   time.Now().Add(RefreshTokenTTL).Format(time.RFC3339),
	}).Err()
	if err != nil {
		return "", "", err
	}
	s.redis.Expire(ctx, redisKey, RefreshTokenTTL)

	return accesToken, refreshToken, nil
}

func authUser(ctx context.Context, s *Service, username string, password string) (int32, bool, error) {
	user, err := s.repo.GetUserByUsername(ctx, username)
	if err != nil {
		if err.Error() == "no rows in result set" {
			return 0, false, ErrInvalidCredentials
		}
		return 0, false, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return 0, false, errors.New("invalid credentials")
	}
	return user.UserId, true, nil
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (string, string, error) {
	// Check Redis for refresh token
	redisKey := "refresh_token:" + refreshToken

	val, err := s.redis.HGetAll(ctx, redisKey).Result()
	if err == redis.Nil || len(val) == 0 {
		return "", "", ErrInvalidRefreshToken
	}

	// **Explicitly Delete the Old Refresh Token First**
	delErr := s.redis.Del(ctx, redisKey).Err()
	if delErr != nil {
		log.Printf("Failed to delete refresh token %s: %v", redisKey, delErr)
	} else {
		log.Printf("Refresh token deleted: %s", redisKey)
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

	// get user from DB
	user, err := s.repo.GetUserByID(ctx, int32(userID))
	if err != nil {
		return "", "", err
	}

	// Generate a new access token
	accessToken, err := s.generateAccessToken(user)
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
		"user_id":      userID,
		"username":     username,
		"avatar_url":   user.AvatarUrl,
		"avatar_color": user.AvatarColor,
		"expires_at":   time.Now().Add(RefreshTokenTTL).Format(time.RFC3339),
	}).Err()
	if err != nil {
		return "", "", err
	}
	s.redis.Expire(ctx, newRedisKey, RefreshTokenTTL)

	return accessToken, newRefreshToken, nil
}

func (s *Service) generateAccessToken(user *dtos.UserDto) (string, error) {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return "", err
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":      float64(user.UserId),
		"username": user.Username,
		"exp":      time.Now().Add(AccessTokenTTL).Unix(),
		"user":     string(userJSON),
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

func getRandomColor() string {
	colors := []string{
		"#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
		"#FFEEAD", "#D4A5A5", "#9B59B6", "#3498DB",
	}
	r := mathrand.New(mathrand.NewSource(time.Now().UnixNano()))
	avatarColor := colors[r.Intn(len(colors))]
	return avatarColor

}
