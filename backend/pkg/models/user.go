package models

type User struct {
	UserId    int32  `json:"user_id"`
	Username  string `json:"username"`
	Password  string `json:"-"` // Omit password from JSON
	AvatarUrl string `json:"avatar_url"`
}
