package friendships

import (
	"context"

	"github.com/andrelcunha/Concord/backend/internal/db"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/jackc/pgx/v5/pgtype"
)

type Repository interface {
	SearchUsersByUsername(ctx context.Context, query string, limit int32) ([]db.SearchUsersByUsernameRow, error)
	CreateFriendship(ctx context.Context, userID, friendID, requesterID int32, status string) (db.Friendship, error)
	GetFriendshipByUsers(ctx context.Context, userID, friendID int32) (db.Friendship, error)
	GetFriendshipByID(ctx context.Context, id int32) (db.Friendship, error)
	UpdateFriendshipStatus(ctx context.Context, userID, friendID int32, status string) (db.Friendship, error)
	DeleteFriendship(ctx context.Context, userID, friendID int32) error
	ListAcceptedFriends(ctx context.Context, userID int32) ([]db.ListAcceptedFriendsRow, error)
	ListIncomingFriendRequests(ctx context.Context, userID int32) ([]db.ListIncomingFriendRequestsRow, error)
	ListOutgoingFriendRequests(ctx context.Context, userID int32) ([]db.ListOutgoingFriendRequestsRow, error)
}

type repository struct {
	db *db.Queries
}

func NewRepository(dbPool *pgxpool.Pool) Repository {
	return &repository{
		db: db.New(dbPool),
	}
}

func (r *repository) SearchUsersByUsername(ctx context.Context, query string, limit int32) ([]db.SearchUsersByUsernameRow, error) {
	return r.db.SearchUsersByUsername(ctx, db.SearchUsersByUsernameParams{
		Column1: pgtype.Text{String: query, Valid: true},
		Limit:   limit,
	})
}

func (r *repository) CreateFriendship(ctx context.Context, userID, friendID, requesterID int32, status string) (db.Friendship, error) {
	return r.db.CreateFriendship(ctx, db.CreateFriendshipParams{
		UserID:      userID,
		FriendID:    friendID,
		RequesterID: requesterID,
		Status:      status,
	})
}

func (r *repository) GetFriendshipByUsers(ctx context.Context, userID, friendID int32) (db.Friendship, error) {
	return r.db.GetFriendshipByUsers(ctx, db.GetFriendshipByUsersParams{
		UserID:   userID,
		FriendID: friendID,
	})
}

func (r *repository) GetFriendshipByID(ctx context.Context, id int32) (db.Friendship, error) {
	return r.db.GetFriendshipByID(ctx, id)
}

func (r *repository) UpdateFriendshipStatus(ctx context.Context, userID, friendID int32, status string) (db.Friendship, error) {
	return r.db.UpdateFriendshipStatus(ctx, db.UpdateFriendshipStatusParams{
		UserID:   userID,
		FriendID: friendID,
		Status:   status,
	})
}

func (r *repository) DeleteFriendship(ctx context.Context, userID, friendID int32) error {
	return r.db.DeleteFriendship(ctx, db.DeleteFriendshipParams{
		UserID:   userID,
		FriendID: friendID,
	})
}

func (r *repository) ListAcceptedFriends(ctx context.Context, userID int32) ([]db.ListAcceptedFriendsRow, error) {
	return r.db.ListAcceptedFriends(ctx, userID)
}

func (r *repository) ListIncomingFriendRequests(ctx context.Context, userID int32) ([]db.ListIncomingFriendRequestsRow, error) {
	return r.db.ListIncomingFriendRequests(ctx, userID)
}

func (r *repository) ListOutgoingFriendRequests(ctx context.Context, userID int32) ([]db.ListOutgoingFriendRequestsRow, error) {
	return r.db.ListOutgoingFriendRequests(ctx, userID)
}
