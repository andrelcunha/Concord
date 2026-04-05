package dtos

import "github.com/andrelcunha/Concord/backend/internal/db"

type ServerDto struct {
	ID        int32  `json:"id"`
	Name      string `json:"name"`
	CreatorID int32  `json:"creatorId"`
	IsPublic  bool   `json:"isPublic"`
	CreatedAt string `json:"createdAt"`
}

// map from db.Server to ServerDto
func FromServerDbToServerDto(server db.Server) ServerDto {
	return ServerDto{
		ID:        server.ID,
		Name:      server.Name,
		CreatorID: server.CreatorID.Int32,
		IsPublic:  server.IsPublic.Bool,
		CreatedAt: server.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}
}
