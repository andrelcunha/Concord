package common

type MessageResponse struct {
	ID        int32  `json:"id"`
	ChannelID int32  `json:"channel_id"`
	UserID    int32  `json:"user_id"`
	Content   string `json:"content"`
	Username  string `json:"username"`
	CreatedAt string `json:"created_at"`
	AvatarURL string `json:"avatar_url"`
}
