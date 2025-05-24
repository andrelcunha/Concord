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

func (s *Service) CreateChannel(ctx context.Context, name string, userID int64) (*db.Channel, error) {
	if name == "" {
		return nil, sql.ErrNoRows
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
