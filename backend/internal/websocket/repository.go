package websocket

// import (
// 	"context"

// 	"github.com/andrelcunha/Concord/backend/internal/db"
// 	"github.com/andrelcunha/Concord/backend/pkg/dtos"
// 	"github.com/jackc/pgx/v5/pgtype"
// 	"github.com/jackc/pgx/v5/pgxpool"
// )

// type repository struct {
// 	db *db.Queries
// }

// type Repository interface {
// 	CreateMessage(ctx context.Context, channelID, userID int32, content, username string) (db.Message, error)
// 	ListMessagesByChannel(ctx context.Context, channelID, limit, offset int32) ([]dtos.MessageDto, error)
// }

// func NewRepository(dbPool *pgxpool.Pool) Repository {
// 	db := db.New(dbPool)
// 	return &repository{
// 		db: db,
// 	}
// }

// func (r *repository) CreateMessage(ctx context.Context, channelID int32, userID int32, content, username string) (db.Message, error) {
// 	message, err := r.db.CreateMessage(ctx, db.CreateMessageParams{
// 		ChannelID: channelID,
// 		UserID:    userID,
// 		Content:   content,
// 	})
// 	if err != nil {
// 		return db.Message{}, err
// 	}
// 	return message, nil
// }

// func (r *repository) ListMessagesByChannel(ctx context.Context, channelID, limit, offset int32) ([]dtos.MessageDto, error) {

// 	messages, err := r.db.ListMessagesByChannel(ctx, db.ListMessagesByChannelParams{
// 		ChannelID: channelID,
// 		Limit:     limit,
// 		Offset:    offset,
// 	})
// 	if err != nil {
// 		return nil, err
// 	}

// 	// Convert ListMessagesByChannelRow to MessageDto
// 	var messageDtos []dtos.MessageDto
// 	for _, m := range messages {
// 		messageDtos = append(messageDtos, dtos.MessageDto{
// 			ID:          int(m.ID),
// 			ChannelID:   int(m.ChannelID),
// 			UserID:      int(m.UserID),
// 			Content:     m.Content,
// 			CreatedAt:   m.CreatedAt.Time,           // Extract the time from pgtype.Timestamptz
// 			AvatarURL:   extractText(m.AvatarUrl),   // Handle possible NULLs
// 			AvatarColor: extractText(m.AvatarColor), // Handle possible NULLs
// 		})
// 	}

// 	return messageDtos, nil
// }

// // Helper function to extract string values safely from pgtype.Text
// func extractText(t pgtype.Text) string {
// 	if t.Valid {
// 		return t.String
// 	}
// 	return ""
// }
