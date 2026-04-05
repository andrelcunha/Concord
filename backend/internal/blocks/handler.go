package blocks

import "github.com/gofiber/fiber/v2"

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) BlockUser(c *fiber.Ctx) error {
	var req struct {
		BlockedUserID int32 `json:"blocked_user_id"`
	}
	if err := c.BodyParser(&req); err != nil || req.BlockedUserID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userID := c.Locals("userID").(int32)
	block, err := h.service.BlockUser(c.Context(), userID, req.BlockedUserID)
	if err != nil {
		if err == ErrCannotBlockYourself {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(block)
}

func (h *Handler) UnblockUser(c *fiber.Ctx) error {
	var req struct {
		BlockedUserID int32 `json:"blocked_user_id"`
	}
	if err := c.BodyParser(&req); err != nil || req.BlockedUserID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userID := c.Locals("userID").(int32)
	if err := h.service.UnblockUser(c.Context(), userID, req.BlockedUserID); err != nil {
		if err == ErrCannotBlockYourself {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(fiber.StatusOK)
}

func (h *Handler) ListBlockedUsers(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int32)
	users, err := h.service.ListBlockedUsers(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"users": users})
}

func RegisterBlockRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	blocked := api.Group("/blocks")
	blocked.Get("/", handler.ListBlockedUsers)
	blocked.Post("/", handler.BlockUser)
	blocked.Delete("/", handler.UnblockUser)
}
