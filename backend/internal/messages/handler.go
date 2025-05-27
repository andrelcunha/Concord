package messages

import (
	"strconv"

	. "github.com/andrelcunha/Concord/backend/internal/common"
	"github.com/gofiber/fiber/v2"
)

type MessageHandler struct {
	Service *Service
}

func NewHandler(service *Service) *MessageHandler {
	return &MessageHandler{Service: service}
}

func (h *MessageHandler) GetMessages(c *fiber.Ctx) error {
	channelID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid channel ID"})
	}

	messageDtos, err := h.Service.ListMessagesByChannel(c.Context(), int32(channelID), 10, 0)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get messages"})
	}
	response := make([]MessageResponse, len(messageDtos))
	for i, dto := range messageDtos {
		response[i] = MessageResponse{
			ID:          dto.ID,
			ChannelID:   dto.ChannelID,
			UserID:      dto.UserID,
			Content:     dto.Content,
			Username:    dto.Username,
			CreatedAt:   dto.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			AvatarURL:   dto.AvatarUrl,
			AvatarColor: dto.AvatarColor,
		}
	}
	return c.JSON(response)
}
func RegisterMessageRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	api.Get("/channels/:id/messages", handler.GetMessages)
}
