package messages

import (
	"context"
	"log"

	"github.com/andrelcunha/Concord/backend/pkg/dtos"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{
		repo: repo,
	}
}

func (s *Service) ListMessagesByChannel(ctx context.Context, channelID, limit, offset int32) ([]dtos.MessageDto, error) {
	messages, err := s.repo.ListMessagesByChannel(ctx, channelID, limit, offset)
	if err != nil {
		log.Printf("ListMessagesByChannel error: %v", err)
		return nil, err
	}
	return messages, nil
}
