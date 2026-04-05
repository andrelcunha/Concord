package channels

import (
	"log"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Service *Service
}

type CreateChannelRequest struct {
	Name     string `json:"name"`
	ServerID int32  `json:"server_id"`
}

func NewHandler(service *Service) *Handler {
	return &Handler{Service: service}
}

func (h *Handler) CreateChannel(c *fiber.Ctx) error {
	var req CreateChannelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Channel name is required"})
	}

	if req.ServerID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Server ID is required"})
	}

	userID, ok := c.Locals("userID").(int32)
	if !ok {
		log.Printf("Invalid userID in Locals: %v (type: %T)", c.Locals("userID"), c.Locals("userID"))
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	// Verify server membership
	isMember, err := h.Service.IsServerMember(c.Context(), req.ServerID, userID)
	if err != nil || !isMember {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Not a server member"})
	}

	channel, err := h.Service.CreateChannel(c.Context(), req.Name, userID, req.ServerID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to create channel"})
	}

	return c.JSON(channel)
}

func (h *Handler) ListChannels(c *fiber.Ctx) error {
	serverID, err := strconv.Atoi(c.Query("server_id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid server ID"})
	}

	userID := c.Locals("userID").(int32)
	isMember, err := h.Service.IsServerMember(c.Context(), int32(serverID), userID)
	if err != nil || !isMember {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Not a server member"})
	}

	channels, err := h.Service.ListChannels(c.Context(), int32(serverID))
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
