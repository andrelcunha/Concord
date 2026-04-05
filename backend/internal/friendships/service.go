package friendships

import (
	"context"
	"errors"

	"github.com/andrelcunha/Concord/backend/internal/blocks"
	"github.com/andrelcunha/Concord/backend/pkg/dtos"
)

var (
	ErrCannotFriendYourself         = errors.New("cannot send a friend request to yourself")
	ErrFriendshipAlreadyExists      = errors.New("friendship already exists")
	ErrFriendshipNotFound           = errors.New("friendship not found")
	ErrFriendRequestNotPending      = errors.New("friend request is not pending")
	ErrNotFriendRequestRecipient    = errors.New("only the recipient can respond to this request")
	ErrBlockedRelationship          = errors.New("friendship is blocked")
)

type Service struct {
	repo      Repository
	blockRepo blocks.Repository
}

func NewService(repo Repository, blockRepo blocks.Repository) *Service {
	return &Service{repo: repo, blockRepo: blockRepo}
}

func normalizePair(a, b int32) (int32, int32) {
	if a < b {
		return a, b
	}
	return b, a
}

func userSummary(userID int32, username, avatarURL, avatarColor string) dtos.UserSummaryDto {
	return dtos.UserSummaryDto{
		UserID:      userID,
		Username:    username,
		AvatarURL:   avatarURL,
		AvatarColor: avatarColor,
	}
}

func (s *Service) SearchUsers(ctx context.Context, userID int32, query string, limit int32) ([]dtos.UserSummaryDto, error) {
	rows, err := s.repo.SearchUsersByUsername(ctx, query, limit)
	if err != nil {
		return nil, err
	}

	var users []dtos.UserSummaryDto
	for _, row := range rows {
		if row.ID == userID {
			continue
		}

		low, high := normalizePair(userID, row.ID)
		if _, err := s.repo.GetFriendshipByUsers(ctx, low, high); err == nil {
			continue
		}
		if _, err := s.blockRepo.GetBlock(ctx, userID, row.ID); err == nil {
			continue
		}
		if _, err := s.blockRepo.GetBlock(ctx, row.ID, userID); err == nil {
			continue
		}

		users = append(users, userSummary(row.ID, row.Username, row.AvatarUrl.String, row.AvatarColor.String))
	}

	return users, nil
}

func (s *Service) SendFriendRequest(ctx context.Context, requesterID, targetUserID int32) (dtos.FriendshipDto, error) {
	if requesterID == targetUserID {
		return dtos.FriendshipDto{}, ErrCannotFriendYourself
	}

	if _, err := s.blockRepo.GetBlock(ctx, requesterID, targetUserID); err == nil {
		return dtos.FriendshipDto{}, ErrBlockedRelationship
	}
	if _, err := s.blockRepo.GetBlock(ctx, targetUserID, requesterID); err == nil {
		return dtos.FriendshipDto{}, ErrBlockedRelationship
	}

	low, high := normalizePair(requesterID, targetUserID)
	if _, err := s.repo.GetFriendshipByUsers(ctx, low, high); err == nil {
		return dtos.FriendshipDto{}, ErrFriendshipAlreadyExists
	}

	friendship, err := s.repo.CreateFriendship(ctx, low, high, requesterID, "pending")
	if err != nil {
		return dtos.FriendshipDto{}, err
	}

	return dtos.FriendshipDto{
		ID:          friendship.ID,
		UserID:      friendship.UserID,
		FriendID:    friendship.FriendID,
		RequesterID: friendship.RequesterID,
		Status:      friendship.Status,
		CreatedAt:   friendship.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

func (s *Service) AcceptFriendRequest(ctx context.Context, currentUserID, friendshipID int32) (dtos.FriendshipDto, error) {
	friendship, err := s.repo.GetFriendshipByID(ctx, friendshipID)
	if err != nil {
		return dtos.FriendshipDto{}, ErrFriendshipNotFound
	}

	if friendship.Status != "pending" {
		return dtos.FriendshipDto{}, ErrFriendRequestNotPending
	}

	recipientID := friendship.UserID
	if friendship.RequesterID == friendship.UserID {
		recipientID = friendship.FriendID
	}
	if recipientID != currentUserID {
		return dtos.FriendshipDto{}, ErrNotFriendRequestRecipient
	}

	friendship, err = s.repo.UpdateFriendshipStatus(ctx, friendship.UserID, friendship.FriendID, "accepted")
	if err != nil {
		return dtos.FriendshipDto{}, err
	}

	return dtos.FriendshipDto{
		ID:          friendship.ID,
		UserID:      friendship.UserID,
		FriendID:    friendship.FriendID,
		RequesterID: friendship.RequesterID,
		Status:      friendship.Status,
		CreatedAt:   friendship.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}, nil
}

func (s *Service) RejectFriendRequest(ctx context.Context, currentUserID, friendshipID int32) error {
	friendship, err := s.repo.GetFriendshipByID(ctx, friendshipID)
	if err != nil {
		return ErrFriendshipNotFound
	}

	if friendship.Status != "pending" {
		return ErrFriendRequestNotPending
	}

	recipientID := friendship.UserID
	if friendship.RequesterID == friendship.UserID {
		recipientID = friendship.FriendID
	}
	if recipientID != currentUserID {
		return ErrNotFriendRequestRecipient
	}

	_, err = s.repo.UpdateFriendshipStatus(ctx, friendship.UserID, friendship.FriendID, "rejected")
	return err
}

func (s *Service) RemoveFriend(ctx context.Context, currentUserID, targetUserID int32) error {
	if currentUserID == targetUserID {
		return ErrCannotFriendYourself
	}

	low, high := normalizePair(currentUserID, targetUserID)
	friendship, err := s.repo.GetFriendshipByUsers(ctx, low, high)
	if err != nil {
		return ErrFriendshipNotFound
	}
	if friendship.Status != "accepted" {
		return ErrFriendshipNotFound
	}

	return s.repo.DeleteFriendship(ctx, low, high)
}

func (s *Service) ListFriends(ctx context.Context, userID int32) ([]dtos.FriendDto, error) {
	rows, err := s.repo.ListAcceptedFriends(ctx, userID)
	if err != nil {
		return nil, err
	}

	friends := make([]dtos.FriendDto, 0, len(rows))
	for _, row := range rows {
		friends = append(friends, dtos.FriendDto{
			UserSummaryDto: userSummary(row.ID, row.Username, row.AvatarUrl.String, row.AvatarColor.String),
			FriendedAt:     row.FriendedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
		})
	}
	return friends, nil
}

func (s *Service) ListIncomingRequests(ctx context.Context, userID int32) ([]dtos.FriendshipDto, error) {
	rows, err := s.repo.ListIncomingFriendRequests(ctx, userID)
	if err != nil {
		return nil, err
	}

	requests := make([]dtos.FriendshipDto, 0, len(rows))
	for _, row := range rows {
		requests = append(requests, dtos.FriendshipDto{
			ID:          row.ID,
			UserID:      row.UserID,
			FriendID:    row.FriendID,
			RequesterID: row.RequesterID,
			Status:      row.Status,
			CreatedAt:   row.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
			User:        userSummary(row.UserID, row.Username, row.AvatarUrl.String, row.AvatarColor.String),
		})
	}

	return requests, nil
}

func (s *Service) ListOutgoingRequests(ctx context.Context, userID int32) ([]dtos.FriendshipDto, error) {
	rows, err := s.repo.ListOutgoingFriendRequests(ctx, userID)
	if err != nil {
		return nil, err
	}

	requests := make([]dtos.FriendshipDto, 0, len(rows))
	for _, row := range rows {
		requests = append(requests, dtos.FriendshipDto{
			ID:          row.ID,
			UserID:      row.UserID,
			FriendID:    row.FriendID,
			RequesterID: row.RequesterID,
			Status:      row.Status,
			CreatedAt:   row.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
			User:        userSummary(row.FriendID, row.Username, row.AvatarUrl.String, row.AvatarColor.String),
		})
	}

	return requests, nil
}
