package auth

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/andrelcunha/Concord/backend/pkg/dtos"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

type mockRepository struct {
	createUserFunc  func(ctx context.Context, user *dtos.UserDto) (*dtos.UserDto, error)
	getUserFunc     func(ctx context.Context, username string) (*dtos.UserDto, error)
	getUserByIDFunc func(ctx context.Context, userID int32) (*dtos.UserDto, error)
}

func (m *mockRepository) CreateUser(ctx context.Context, user *dtos.UserDto) (*dtos.UserDto, error) {
	return m.createUserFunc(ctx, user)
}

func (m *mockRepository) GetUserByUsername(ctx context.Context, username string) (*dtos.UserDto, error) {
	return m.getUserFunc(ctx, username)
}

func (m *mockRepository) GetUserByID(ctx context.Context, userID int32) (*dtos.UserDto, error) {
	return m.getUserByIDFunc(ctx, userID)
}

// Mock getRandomColor for deterministic tests
var mockGetRandomColor = func() string {
	return "#FF6B6B"
}

func TestService_Register(t *testing.T) {
	// Arrange
	mockRepo := &mockRepository{
		createUserFunc: func(ctx context.Context, user *dtos.UserDto) (*dtos.UserDto, error) {
			// Simulate password hashing
			hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
			return &dtos.UserDto{
				UserId:      1,
				Username:    user.Username,
				AvatarColor: user.AvatarColor,
				Password:    string(hashedPassword),
			}, nil
		},
	}
	mockRedis := redis.NewClient(&redis.Options{})
	service := NewService(mockRepo, mockRedis, "testsecret")

	// // Override getRandomColor for test
	// originalGetRandomColor := GetRandomColor
	// GetRandomColor = mockGetRandomColor
	// defer func() { GetRandomColor = originalGetRandomColor }()

	// Act
	user, err := service.Register(context.Background(), "testuser", "password123")

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, "testuser", user.Username)
	// assert.Equal(t, "#FF6B6B", user.AvatarColor)
	assert.NotEmpty(t, user.Password) // Hashed password
	assert.Equal(t, int32(1), user.UserId)
}
func TestService_Login(t *testing.T) {
	ctx := context.Background()
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	mockRepo := &mockRepository{
		getUserFunc: func(ctx context.Context, username string) (*dtos.UserDto, error) {
			if username == "testuser" {
				return &dtos.UserDto{
					UserId:      1,
					Username:    "testuser",
					Password:    string(hashedPassword),
					AvatarColor: "#FF6B6B",
					AvatarUrl:   "",
				}, nil
			}
			return nil, errors.New("User not found")
		},
		getUserByIDFunc: func(ctx context.Context, userID int32) (*dtos.UserDto, error) {
			if userID == 1 {
				return &dtos.UserDto{
					UserId:      1,
					Username:    "testuser",
					Password:    string(hashedPassword),
					AvatarColor: "#FF6B6B",
					AvatarUrl:   "",
				}, nil
			}
			return nil, errors.New("User not found")
		},
	}
	secret := "testsecret"
	mr, _ := miniredis.Run()
	mockRedis := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	service := NewService(mockRepo, mockRedis, secret)

	accessToken, refreshToken, err := service.Login(ctx, "testuser", "password123")
	assert.NoError(t, err)
	assert.NotEmpty(t, accessToken)
	assert.NotEmpty(t, refreshToken)

	// Verify JWT token
	parsedToken, err := jwt.Parse(accessToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	assert.NoError(t, err)
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	assert.True(t, ok)
	assert.Equal(t, "testuser", claims["username"])
	assert.Equal(t, float64(1), claims["sub"])

	// Verify refresh token in Redis
	storedToken, err := mockRedis.HGetAll(ctx, "refresh_token:"+refreshToken).Result()
	assert.NoError(t, err)
	assert.Equal(t, "testuser", storedToken["username"])
	assert.Equal(t, "1", storedToken["user_id"])
	assert.Equal(t, "", storedToken["avatar_url"])
	assert.Equal(t, "#FF6B6B", storedToken["avatar_color"])
	assert.NotEmpty(t, storedToken["expires_at"])

	// Test invalid password
	_, _, err = service.Login(ctx, "testuser", "wrongpassword")
	assert.Error(t, err)
	assert.Equal(t, "invalid credentials", err.Error())
}

func TestService_Refresh(t *testing.T) {
	ctx := context.Background()
	secret := "testsecret"
	mockRepo := &mockRepository{
		getUserByIDFunc: func(ctx context.Context, userID int32) (*dtos.UserDto, error) {
			if userID == 1 {
				return &dtos.UserDto{
					UserId:      1,
					Username:    "testuser",
					AvatarColor: "#FF6B6B",
					AvatarUrl:   "",
				}, nil
			}
			return nil, errors.New("User not found")
		},
	}
	mr, _ := miniredis.Run()
	redisClient := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	service := NewService(mockRepo, redisClient, secret)

	// Set refresh token in Redis
	refreshToken := "test-refresh-token"
	redisClient.HSet(ctx, "refresh_token:"+refreshToken, map[string]interface{}{
		"user_id":      "1",
		"username":     "testuser",
		"avatar_url":   "",
		"avatar_color": "#FF6B6B",
		"expires_at":   time.Now().Add(RefreshTokenTTL).Format(time.RFC3339),
	})

	accessToken, newRefreshToken, err := service.Refresh(ctx, refreshToken)
	assert.NoError(t, err)
	assert.NotEmpty(t, newRefreshToken)
	assert.NotEmpty(t, accessToken)

	// Verify new JWT
	parsedToken, err := jwt.Parse(accessToken, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	assert.NoError(t, err)
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	assert.True(t, ok)
	assert.Equal(t, "testuser", claims["username"])
	assert.Equal(t, float64(1), claims["sub"])

	// Verify new refresh token in Redis
	newStoredToken, err := redisClient.HGetAll(ctx, "refresh_token:"+newRefreshToken).Result()
	assert.NoError(t, err)
	assert.Equal(t, "testuser", newStoredToken["username"])
	assert.Equal(t, "1", newStoredToken["user_id"])
	assert.Equal(t, "", newStoredToken["avatar_url"])
	assert.Equal(t, "#FF6B6B", newStoredToken["avatar_color"])
	assert.NotEmpty(t, newStoredToken["expires_at"])

	// Verify old token deleted
	storedToken, err := redisClient.HGetAll(ctx, "refresh_token:"+refreshToken).Result()
	assert.Empty(t, storedToken)

	// Test invalid token
	_, _, err = service.Refresh(ctx, "invalid-token")
	assert.Error(t, err)
	assert.Equal(t, ErrInvalidRefreshToken, err)

	// Test expired token
	expiredToken := "expired-refresh-token"
	redisClient.HSet(ctx, "refresh_token:"+expiredToken, map[string]interface{}{
		"user_id":      "1",
		"username":     "testuser",
		"avatar_url":   "",
		"avatar_color": "#FF6B6B",
		"expires_at":   time.Now().Add(-RefreshTokenTTL).Format(time.RFC3339),
	})
	_, _, err = service.Refresh(ctx, expiredToken)
	assert.Error(t, err)
	assert.Equal(t, ErrExpiredRefreshToken, err)
}
