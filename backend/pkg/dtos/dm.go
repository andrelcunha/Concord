package dtos

import "time"

type DmConversationDto struct {
	ID             int32          `json:"id"`
	CreatedAt      string         `json:"created_at"`
	OtherUser      UserSummaryDto `json:"other_user"`
	LastMessage    string         `json:"last_message"`
	LastMessageAt  string         `json:"last_message_at,omitempty"`
}

type DmMessageDto struct {
	ID             int32     `json:"id"`
	ConversationID int32     `json:"conversation_id"`
	UserID         int32     `json:"user_id"`
	Username       string    `json:"username"`
	Content        string    `json:"content"`
	CreatedAt      time.Time `json:"created_at"`
	AvatarURL      string    `json:"avatar_url,omitempty"`
	AvatarColor    string    `json:"avatar_color"`
}
