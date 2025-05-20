package channels

import (
	"context"
	"database/sql"

	"github.com/andrelcunha/Concord/backend/internal/db"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateChannel(ctx context.Context, name, username string) (*db.Channel, error) {
	if name == "" {
		return nil, sql.ErrNoRows
	}

	userID, err := s.repo.GetUserIDByUsername(ctx, username)
	if err == sql.ErrNoRows {
		return nil, sql.ErrNoRows
	}
	if err != nil {
		return nil, err
	}

	channel, err := s.repo.CreateChannel(ctx, name, userID)
	if err != nil {
		return nil, err
	}
	return &channel, nil
}

func (s *Service) ListChannels(ctx context.Context) ([]db.Channel, error) {
	return s.repo.ListChannels(ctx)
}
