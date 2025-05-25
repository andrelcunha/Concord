package common

type MessageResponse struct {
	ID          int    `json:"id"`
	ChannelID   int    `json:"channel_id"`
	UserID      int    `json:"user_id"`
	Content     string `json:"content"`
	Username    string `json:"username"`
	CreatedAt   string `json:"created_at"`
	AvatarURL   string `json:"avatar_url"`
	AvatarColor string `json:"avatar_color"`
}
