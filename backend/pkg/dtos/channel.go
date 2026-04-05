package dtos

import "github.com/andrelcunha/Concord/backend/internal/db"

type ChannelDto struct {
	ID        int32  `json:"id"`
	Name      string `json:"name"`
	CreatedBy int32  `json:"createdBy"`
	ServerID  int32  `json:"serverId"`
	CreatedAt string `json:"createdAt"`
}

// map from db.CreateChannelRow to ChannelDto
func FromCreateChannelRowToChannelDto(channel db.CreateChannelRow) ChannelDto {
	return ChannelDto{
		ID:        channel.ID,
		Name:      channel.Name,
		CreatedBy: channel.CreatedBy.Int32,
		ServerID:  channel.ServerID,
		CreatedAt: channel.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// map from []db.ListChannelsRow to []ChannelDto
func FromListChannelRowsToChannelDtos(channels []db.ListChannelsRow) []ChannelDto {
	channelDtos := make([]ChannelDto, len(channels))
	for i, channel := range channels {
		channelDtos[i] = FromListChannelRowToChannelDto(channel)
	}
	return channelDtos
}

// map from db.ListChannelsRow to ChannelDto
func FromListChannelRowToChannelDto(channel db.ListChannelsRow) ChannelDto {
	return ChannelDto{
		ID:        channel.ID,
		Name:      channel.Name,
		CreatedBy: channel.CreatedBy.Int32,
		ServerID:  channel.ServerID,
		CreatedAt: channel.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}
}

func FromGetChannelRowToChannelDto(channel db.GetChannelRow) ChannelDto {
	return ChannelDto{
		ID:        channel.ID,
		Name:      channel.Name,
		CreatedBy: channel.CreatedBy.Int32,
		ServerID:  channel.ServerID,
		CreatedAt: channel.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
	}
}
