package friendships

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

func (h *Handler) SearchUsers(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int32)
	query := c.Query("query")

	users, err := h.service.SearchUsers(c.Context(), userID, query, 20)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"users": users})
}

func (h *Handler) SendFriendRequest(c *fiber.Ctx) error {
	var req struct {
		TargetUserID int32 `json:"target_user_id"`
	}
	if err := c.BodyParser(&req); err != nil || req.TargetUserID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}

	userID := c.Locals("userID").(int32)
	friendship, err := h.service.SendFriendRequest(c.Context(), userID, req.TargetUserID)
	if err != nil {
		return friendshipErrorResponse(c, err)
	}
	return c.JSON(friendship)
}

func (h *Handler) ListFriends(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int32)
	friends, err := h.service.ListFriends(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"friends": friends})
}

func (h *Handler) ListIncomingRequests(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int32)
	requests, err := h.service.ListIncomingRequests(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"requests": requests})
}

func (h *Handler) ListOutgoingRequests(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int32)
	requests, err := h.service.ListOutgoingRequests(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"requests": requests})
}

func (h *Handler) AcceptFriendRequest(c *fiber.Ctx) error {
	friendshipID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid friendship ID"})
	}

	userID := c.Locals("userID").(int32)
	friendship, err := h.service.AcceptFriendRequest(c.Context(), userID, int32(friendshipID))
	if err != nil {
		return friendshipErrorResponse(c, err)
	}
	return c.JSON(friendship)
}

func (h *Handler) RejectFriendRequest(c *fiber.Ctx) error {
	friendshipID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid friendship ID"})
	}

	userID := c.Locals("userID").(int32)
	if err := h.service.RejectFriendRequest(c.Context(), userID, int32(friendshipID)); err != nil {
		return friendshipErrorResponse(c, err)
	}
	return c.SendStatus(fiber.StatusOK)
}

func (h *Handler) RemoveFriend(c *fiber.Ctx) error {
	friendID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid friend ID"})
	}

	userID := c.Locals("userID").(int32)
	if err := h.service.RemoveFriend(c.Context(), userID, int32(friendID)); err != nil {
		return friendshipErrorResponse(c, err)
	}
	return c.SendStatus(fiber.StatusOK)
}

func friendshipErrorResponse(c *fiber.Ctx, err error) error {
	switch err {
	case ErrCannotFriendYourself:
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	case ErrFriendshipAlreadyExists, ErrBlockedRelationship:
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	case ErrFriendshipNotFound:
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	case ErrFriendRequestNotPending, ErrNotFriendRequestRecipient:
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": err.Error()})
	default:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}
}

func RegisterFriendshipRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	friends := api.Group("/friends")
	friends.Get("/search", handler.SearchUsers)
	friends.Get("/", handler.ListFriends)
	friends.Post("/requests", handler.SendFriendRequest)
	friends.Get("/requests/incoming", handler.ListIncomingRequests)
	friends.Get("/requests/outgoing", handler.ListOutgoingRequests)
	friends.Post("/requests/:id/accept", handler.AcceptFriendRequest)
	friends.Post("/requests/:id/reject", handler.RejectFriendRequest)
	friends.Delete("/:id", handler.RemoveFriend)
}
