package dms

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) ListConversations(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int32)
	conversations, err := h.service.ListConversations(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"conversations": conversations})
}

func (h *Handler) CreateOrGetConversation(c *fiber.Ctx) error {
	var req struct {
		OtherUserID int32 `json:"other_user_id"`
	}
	if err := c.BodyParser(&req); err != nil || req.OtherUserID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userID := c.Locals("userID").(int32)
	conversation, err := h.service.CreateOrGetConversation(c.Context(), userID, req.OtherUserID)
	if err != nil {
		return dmErrorResponse(c, err)
	}
	return c.JSON(conversation)
}

func (h *Handler) GetConversation(c *fiber.Ctx) error {
	conversationID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid conversation ID"})
	}

	userID := c.Locals("userID").(int32)
	conversation, err := h.service.GetConversation(c.Context(), userID, int32(conversationID))
	if err != nil {
		return dmErrorResponse(c, err)
	}
	return c.JSON(conversation)
}

func (h *Handler) HideConversation(c *fiber.Ctx) error {
	conversationID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid conversation ID"})
	}

	userID := c.Locals("userID").(int32)
	if err := h.service.HideConversation(c.Context(), userID, int32(conversationID)); err != nil {
		return dmErrorResponse(c, err)
	}
	return c.SendStatus(fiber.StatusOK)
}

func (h *Handler) ListMessages(c *fiber.Ctx) error {
	conversationID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid conversation ID"})
	}

	userID := c.Locals("userID").(int32)
	messages, err := h.service.ListMessages(c.Context(), userID, int32(conversationID), 50, 0)
	if err != nil {
		return dmErrorResponse(c, err)
	}
	return c.JSON(messages)
}

func dmErrorResponse(c *fiber.Ctx, err error) error {
	switch err {
	case ErrDmForbidden:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	case ErrDmRequiresFriendship:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	case ErrDmBlockedRelationship:
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
}

func RegisterDmRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	dms := api.Group("/dms")
	dms.Get("/", handler.ListConversations)
	dms.Post("/", handler.CreateOrGetConversation)
	dms.Get("/:id", handler.GetConversation)
	dms.Delete("/:id", handler.HideConversation)
	dms.Get("/:id/messages", handler.ListMessages)
}
