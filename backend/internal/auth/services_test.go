package auth

import (
	"context"
	"errors"
	"testing"

	"github.com/andrelcunha/Concord/backend/pkg/models"
	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
)

type MockRepository struct {
	createUserFunc func(ctx context.Context, user *models.User) error
	getUserFunc    func(ctx context.Context, username string) (*models.User, error)
}

func (m *MockRepository) CreateUser(ctx context.Context, user *models.User) error {
	return m.createUserFunc(ctx, user)
}

func (m *MockRepository) GetUserByUsername(ctx context.Context, username string) (*models.User, error) {
	return m.getUserFunc(ctx, username)
}

func TestService_Register(t *testing.T) {
	mockRepo := &MockRepository{
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
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	mockRepo := &MockRepository{
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
	mockRedis := redis.NewClient(&redis.Options{})
	service := NewService(mockRepo, mockRedis, "testsecret")

	accessToken, refreshToken, err := service.Login(context.Background(), "testuser", "password123")
	assert.NoError(t, err)
	assert.NotEmpty(t, accessToken)
	assert.NotEmpty(t, refreshToken)

	accessToken, refreshToken, err = service.Login(context.Background(), "testuser", "wrongpassword")
	assert.Error(t, err)
}
