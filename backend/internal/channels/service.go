package channels

import (
	"context"
	"database/sql"

	"github.com/andrelcunha/Concord/backend/internal/servers"

	"github.com/andrelcunha/Concord/backend/pkg/dtos"
)

type Service struct {
	repo       Repository
	serverRepo servers.Repository
}

func NewService(repo Repository, serverRepo servers.Repository) *Service {
	return &Service{repo: repo, serverRepo: serverRepo}
}

func (s *Service) CreateChannel(ctx context.Context, name string, userID, serverID int32) (*dtos.ChannelDto, error) {
	if name == "" {
		return nil, sql.ErrNoRows
	}

	channel, err := s.repo.CreateChannel(ctx, name, userID, serverID)
	if err != nil {
		return nil, err
	}
	dto := dtos.FromCreateChannelRowToChannelDto(channel)
	return &dto, nil
}
func (s *Service) ListChannels(ctx context.Context, serverID int32) ([]dtos.ChannelDto, error) {
	channels, err := s.repo.ListChannels(ctx, serverID)
	if err != nil {
		return nil, err
	}
	dtos := dtos.FromListChannelRowsToChannelDtos(channels)
	return dtos, nil
}

func (s *Service) IsServerMember(ctx context.Context, serverID, userID int32) (bool, error) {
	return s.serverRepo.IsServerMember(ctx, serverID, userID)
}
