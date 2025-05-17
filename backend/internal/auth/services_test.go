package auth

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	"github.com/andrelcunha/Concord/backend/pkg/models"
	"github.com/golang-jwt/jwt/v5"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

type mockRepository struct {
	createUserFunc func(ctx context.Context, user *models.User) error
	getUserFunc    func(ctx context.Context, username string) (*models.User, error)
}

func (m *mockRepository) CreateUser(ctx context.Context, user *models.User) error {
	return m.createUserFunc(ctx, user)
}

func (m *mockRepository) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return m.getUserFunc(ctx, username)
}

func TestService_Register(t *testing.T) {
	mockRepo := &mockRepository{
		createUserFunc: func(ctx context.Context, user *models.User) error {
			return nil
		},
	}
	// Arrange
	mockRedis := redis.NewClient(&redis.Options{})
	service := NewService(mockRepo, mockRedis, "testsecret")

	// // Act
	user, err := service.Register(context.Background(), "testuser", "password123")

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, "testuser", user.Username)
	assert.NotEmpty(t, user.Password) // Hashed password
}

func TestService_Login(t *testing.T) {
	ctx := context.Background()
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	mockRepo := &mockRepository{
		getUserFunc: func(ctx context.Context, username string) (*models.User, error) {
			if username == "testuser" {
				return &models.User{
					Username: "testuser",
					Password: string(hashedPassword),
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
	assert.Equal(t, "testuser", claims["sub"])

	// Verify refresh token in Redis
	// storedToken, err := mockRedis.Get(ctx, "refresh:testuser").Result()
	storedToken, err := mockRedis.HGetAll(ctx, refreshToken).Result()
	assert.NoError(t, err)
	assert.Equal(t, "testuser", storedToken["username"])

	_, _, err = service.Login(ctx, "testuser", "wrongpassword")
	assert.Error(t, err)
}

func TestService_Refresh(t *testing.T) {
	ctx := context.Background()
	secret := "testsecret"
	repo := &mockRepository{}
	mr, _ := miniredis.Run()
	redisClient := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	service := NewService(repo, redisClient, secret)

	// Set refresh token in Redis
	refreshToken := "test-refresh-token"
	redisClient.HSet(ctx, "refresh_token:"+refreshToken, map[string]interface{}{
		"username":   "testuser",
		"expires_at": time.Now().Add(RefreshTokenTTL).Format(time.RFC3339),
	})

	accessToken, newRefreshToken, err := service.Refresh(context.Background(), refreshToken)
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
	assert.Equal(t, "testuser", claims["sub"])

	_, _, err = service.Refresh(context.Background(), "invalid-token")
	assert.Error(t, err)
}
