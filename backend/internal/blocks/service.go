package blocks

import (
	"context"
	"errors"

	"github.com/andrelcunha/Concord/backend/pkg/dtos"
)

var ErrCannotBlockYourself = errors.New("cannot block yourself")

type Service struct {
	repo Repository
}

func NewService(repo Repository) *Service {
	return &Service{repo: repo}
}

func (s *Service) BlockUser(ctx context.Context, blockerID, blockedID int32) (dtos.BlockDto, error) {
	if blockerID == blockedID {
		return dtos.BlockDto{}, ErrCannotBlockYourself
	}

	block, err := s.repo.CreateBlock(ctx, blockerID, blockedID)
	if err != nil {
		return dtos.BlockDto{}, err
	}

	return dtos.BlockDto{
		ID:        block.ID,
		BlockedID: block.BlockedID,
		CreatedAt: block.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

func (s *Service) UnblockUser(ctx context.Context, blockerID, blockedID int32) error {
	if blockerID == blockedID {
		return ErrCannotBlockYourself
	}
	return s.repo.DeleteBlock(ctx, blockerID, blockedID)
}

func (s *Service) ListBlockedUsers(ctx context.Context, blockerID int32) ([]dtos.BlockDto, error) {
	rows, err := s.repo.ListBlockedUsers(ctx, blockerID)
	if err != nil {
		return nil, err
	}

	blocks := make([]dtos.BlockDto, 0, len(rows))
	for _, row := range rows {
		blocks = append(blocks, dtos.BlockDto{
			ID:        row.ID,
			BlockedID: row.BlockedID,
			CreatedAt: row.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
			User: dtos.UserSummaryDto{
				UserID:      row.BlockedID,
				Username:    row.Username,
				AvatarURL:   row.AvatarUrl.String,
				AvatarColor: row.AvatarColor.String,
			},
		})
	}

	return blocks, nil
}
