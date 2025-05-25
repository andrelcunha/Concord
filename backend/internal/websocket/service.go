package websocket

import (
	"context"
	"fmt"
	"log"

	"github.com/andrelcunha/Concord/backend/internal/messages"
	"github.com/andrelcunha/Concord/backend/pkg/dtos"
	"github.com/redis/go-redis/v9"
)

type Service struct {
	repo  messages.Repository
	redis *redis.Client
}

func NewService(repo messages.Repository, redis *redis.Client) *Service {
	return &Service{
		repo:  repo,
		redis: redis,
	}
}

func (s *Service) StoreMessage(ctx context.Context, channelID, userID int32, content, username string) (dtos.MessageDto, error) {
	message, err := s.repo.CreateMessage(ctx, channelID, userID, content, username)
	if err != nil {
		log.Printf("CreateMessage error: %v", err)
		return dtos.MessageDto{}, err
	}

	return message, nil
}

func (s *Service) ListMessagesByChannel(ctx context.Context, channelID, limit, offset int32) ([]dtos.MessageDto, error) {
	messages, err := s.repo.ListMessagesByChannel(ctx, channelID, limit, offset)
	if err != nil {
		log.Printf("ListMessagesByChannel error: %v", err)
		return nil, err
	}
	return messages, nil
}

func (s *Service) BroadcastMessage(ctx context.Context, channelID, userID int32, messageJSON []byte) error {
	channelIDStr := fmt.Sprintf("%d", channelID)
	err := s.redis.Publish(ctx, "channel:"+channelIDStr, messageJSON).Err()
	if err != nil {
		log.Printf("Publish error: %v", err)
		return err
	}
	return nil
}
