package messages

import (
	"strconv"

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

	messages, err := h.Service.ListMessagesByChannel(c.Context(), int32(channelID), 10, 0)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to get messages"})
	}
	return c.JSON(messages)
}

func RegisterMessageRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	api.Get("/channels/:id/messages", handler.GetMessages)
}
