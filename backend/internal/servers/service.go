package servers

import (
	"context"

	"github.com/andrelcunha/Concord/backend/pkg/dtos"
)

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) CreateServer(ctx context.Context, name string, userID int32, isPublic bool) (dtos.ServerDto, error) {
	serverDb, err := s.repo.CreateServer(ctx, name, userID, isPublic)
	if err != nil {
		return dtos.ServerDto{}, err
	}
	return dtos.FromServerDbToServerDto(serverDb), nil
}

func (r *Service) ListUserServers(ctx context.Context, userID int32) ([]dtos.ServerDto, error) {
	serversDb, err := r.repo.ListUserServers(ctx, userID)
	if err != nil {
		return nil, err
	}
	serversDto := make([]dtos.ServerDto, len(serversDb))
	for i, serverDb := range serversDb {
		serversDto[i] = dtos.FromServerDbToServerDto(serverDb)
	}
	return serversDto, nil
}

func (s *Service) IsServerMember(ctx context.Context, serverID, userID int32) (bool, error) {
	return s.repo.IsServerMember(ctx, serverID, userID)
}

func (s *Service) JoinServer(ctx context.Context, serverID, userID int32) error {
	return s.repo.JoinServer(ctx, serverID, userID)
}

func (s *Service) GetServer(ctx context.Context, serverID int32) (dtos.ServerDto, error) {
	serverDb, err := s.repo.GetServer(ctx, serverID)
	if err != nil {
		return dtos.ServerDto{}, err
	}
	return dtos.FromServerDbToServerDto(serverDb), nil
}
