package dms

import (
	"context"
	"errors"

	"github.com/andrelcunha/Concord/backend/internal/blocks"
	"github.com/andrelcunha/Concord/backend/internal/friendships"
	"github.com/andrelcunha/Concord/backend/pkg/dtos"
)

var (
	ErrDmForbidden             = errors.New("you do not have access to this direct message")
	ErrDmRequiresFriendship    = errors.New("starting a new direct message requires an accepted friendship")
	ErrDmBlockedRelationship   = errors.New("direct message is blocked")
)

type Service struct {
	repo           Repository
	friendshipRepo friendships.Repository
	blockRepo      blocks.Repository
}

func NewService(repo Repository, friendshipRepo friendships.Repository, blockRepo blocks.Repository) *Service {
	return &Service{repo: repo, friendshipRepo: friendshipRepo, blockRepo: blockRepo}
}

func normalizePair(a, b int32) (int32, int32) {
	if a < b {
		return a, b
	}
	return b, a
}

func (s *Service) ListConversations(ctx context.Context, userID int32) ([]dtos.DmConversationDto, error) {
	rows, err := s.repo.ListVisibleDmConversationsForUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	conversations := make([]dtos.DmConversationDto, 0, len(rows))
	for _, row := range rows {
		dto := dtos.DmConversationDto{
			ID:        row.ID,
			CreatedAt: row.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
			OtherUser: dtos.UserSummaryDto{
				UserID:      row.OtherUserID,
				Username:    row.OtherUsername,
				AvatarURL:   row.OtherAvatarUrl.String,
				AvatarColor: row.OtherAvatarColor.String,
			},
			LastMessage: row.LastMessageContent,
		}
		if row.LastMessageCreatedAt.Valid {
			dto.LastMessageAt = row.LastMessageCreatedAt.Time.Format("2006-01-02T15:04:05Z07:00")
		}
		conversations = append(conversations, dto)
	}

	return conversations, nil
}

func (s *Service) CreateOrGetConversation(ctx context.Context, userID, otherUserID int32) (dtos.DmConversationDto, error) {
	if _, err := s.blockRepo.GetBlock(ctx, userID, otherUserID); err == nil {
		return dtos.DmConversationDto{}, ErrDmBlockedRelationship
	}
	if _, err := s.blockRepo.GetBlock(ctx, otherUserID, userID); err == nil {
		return dtos.DmConversationDto{}, ErrDmBlockedRelationship
	}

	conversation, err := s.repo.GetDmConversationByUserPair(ctx, userID, otherUserID)
	if err == nil {
		if err := s.repo.UnhideDmConversationForUser(ctx, conversation.ID, userID); err != nil {
			return dtos.DmConversationDto{}, err
		}
		return s.GetConversation(ctx, userID, conversation.ID)
	}

	low, high := normalizePair(userID, otherUserID)
	friendship, err := s.friendshipRepo.GetFriendshipByUsers(ctx, low, high)
	if err != nil || friendship.Status != "accepted" {
		return dtos.DmConversationDto{}, ErrDmRequiresFriendship
	}

	conversation, err = s.repo.CreateConversationWithParticipants(ctx, userID, otherUserID)
	if err != nil {
		return dtos.DmConversationDto{}, err
	}
	return s.GetConversation(ctx, userID, conversation.ID)
}

func (s *Service) GetConversation(ctx context.Context, userID, conversationID int32) (dtos.DmConversationDto, error) {
	row, err := s.repo.GetDmConversationForUser(ctx, conversationID, userID)
	if err != nil {
		return dtos.DmConversationDto{}, ErrDmForbidden
	}

	return dtos.DmConversationDto{
		ID:        row.ID,
		CreatedAt: row.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
		OtherUser: dtos.UserSummaryDto{
			UserID:      row.OtherUserID,
			Username:    row.OtherUsername,
			AvatarURL:   row.OtherAvatarUrl.String,
			AvatarColor: row.OtherAvatarColor.String,
		},
	}, nil
}

func (s *Service) HideConversation(ctx context.Context, userID, conversationID int32) error {
	if _, err := s.repo.GetDmConversationParticipant(ctx, conversationID, userID); err != nil {
		return ErrDmForbidden
	}
	return s.repo.HideDmConversationForUser(ctx, conversationID, userID)
}

func (s *Service) ListMessages(ctx context.Context, userID, conversationID, limit, offset int32) ([]dtos.DmMessageDto, error) {
	if _, err := s.repo.GetDmConversationParticipant(ctx, conversationID, userID); err != nil {
		return nil, ErrDmForbidden
	}

	rows, err := s.repo.ListDmMessagesByConversation(ctx, conversationID, limit, offset)
	if err != nil {
		return nil, err
	}

	messages := make([]dtos.DmMessageDto, 0, len(rows))
	for _, row := range rows {
		messages = append(messages, dtos.DmMessageDto{
			ID:             row.ID,
			ConversationID: row.ConversationID,
			UserID:         row.UserID,
			Username:       row.Username.String,
			Content:        row.Content,
			CreatedAt:      row.CreatedAt.Time,
			AvatarURL:      row.AvatarUrl.String,
			AvatarColor:    row.AvatarColor.String,
		})
	}
	return messages, nil
}
