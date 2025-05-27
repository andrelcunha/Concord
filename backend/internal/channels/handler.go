package channels

import (
	"log"

	"github.com/gofiber/fiber/v2"
)

type ChannelsHandler struct {
	Service *Service
}

type CreateChannelRequest struct {
	Name string
}

func NewHandler(service *Service) *ChannelsHandler {
	return &ChannelsHandler{Service: service}
}

func (h *ChannelsHandler) CreateChannel(c *fiber.Ctx) error {
	var req CreateChannelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Channel name is required"})
	}

	userID, ok := c.Locals("userID").(int32)
	if !ok {
		log.Printf("Invalid userID in Locals: %v (type: %T)", c.Locals("userID"), c.Locals("userID"))
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	channel, err := h.Service.CreateChannel(c.Context(), req.Name, int64(userID))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create channel"})
	}

	return c.JSON(channel)
}

func (h *ChannelsHandler) ListChannels(c *fiber.Ctx) error {
	channels, err := h.Service.ListChannels(c.Context())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to list channels"})
	}

	return c.JSON(channels)
}

func RegisterChannelsRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	channels := api.Group("/channels")
	channels.Post("/", handler.CreateChannel)
	channels.Get("/", handler.ListChannels)

}
