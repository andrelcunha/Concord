package dtos

import "time"

type MessageDto struct {
	ID          int       `json:"id"`
	ChannelID   int       `json:"channelId"`
	UserID      int       `json:"userId"`
	Username    string    `json:"username"`
	Content     string    `json:"content"`
	CreatedAt   time.Time `json:"createdAt"`
	AvatarUrl   string    `json:"avatarUrl,omitempty"`
	AvatarColor string    `json:"avatarColor"`
}
