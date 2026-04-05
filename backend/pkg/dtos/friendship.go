package dtos

type UserSummaryDto struct {
	UserID      int32  `json:"user_id"`
	Username    string `json:"username"`
	AvatarURL   string `json:"avatar_url"`
	AvatarColor string `json:"avatar_color"`
}

type FriendshipDto struct {
	ID          int32          `json:"id"`
	UserID      int32          `json:"user_id"`
	FriendID    int32          `json:"friend_id"`
	RequesterID int32          `json:"requester_id"`
	Status      string         `json:"status"`
	CreatedAt   string         `json:"created_at"`
	User        UserSummaryDto `json:"user"`
}

type FriendDto struct {
	UserSummaryDto
	FriendedAt string `json:"friended_at"`
}

type BlockDto struct {
	ID        int32          `json:"id"`
	BlockedID int32          `json:"blocked_id"`
	CreatedAt string         `json:"created_at"`
	User      UserSummaryDto `json:"user"`
}
