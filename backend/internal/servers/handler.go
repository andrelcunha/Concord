package servers

import (
	"database/sql"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type Handler struct {
	Service *Service
}

type CreateServerRequest struct {
	Name     string `json:"name"`
	IsPublic bool   `json:"is_public"`
}

type CreateServerResponse struct {
	ID        int32  `json:"id"`
	Name      string `json:"name"`
	CreatorID int32  `json:"creator_id"`
	IsPublic  bool   `json:"is_public"`
	CreatedAt string `json:"created_at"`
}

type ListUserServersResponse struct {
	Servers []CreateServerResponse `json:"servers"`
}

func NewHandler(service *Service) *Handler {
	return &Handler{Service: service}
}

func (h *Handler) CreateServer(c *fiber.Ctx) error {
	var req CreateServerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid request"})
	}
	userID := c.Locals("userID").(int32)

	serverDto, err := h.Service.CreateServer(c.Context(), req.Name, userID, req.IsPublic)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	err = h.Service.JoinServer(c.Context(), serverDto.ID, userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to join server"})
	}
	serverResponse := CreateServerResponse{
		ID:        serverDto.ID,
		Name:      serverDto.Name,
		CreatorID: serverDto.CreatorID,
		IsPublic:  serverDto.IsPublic,
		CreatedAt: serverDto.CreatedAt,
	}

	return c.JSON(serverResponse)
}

func (h *Handler) ListUserServers(c *fiber.Ctx) error {
	userID := c.Locals("userID").(int32)
	serverDtos, err := h.Service.ListUserServers(c.Context(), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	servers := make([]CreateServerResponse, len(serverDtos))
	for i, serverDto := range serverDtos {
		servers[i] = CreateServerResponse{
			ID:        serverDto.ID,
			Name:      serverDto.Name,
			CreatorID: serverDto.CreatorID,
			IsPublic:  serverDto.IsPublic,
			CreatedAt: serverDto.CreatedAt,
		}
	}

	listUserServersResponse := ListUserServersResponse{
		Servers: servers,
	}
	return c.JSON(ListUserServersResponse(listUserServersResponse))
}

func (h *Handler) JoinServer(c *fiber.Ctx) error {
	serverID, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid server ID"})
	}
	userID := c.Locals("userID").(int32)

	server, err := h.Service.GetServer(c.Context(), int32(serverID))
	if err != nil && err != sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Server not found"})
	}

	if !server.IsPublic {
		isMember, err := h.Service.IsServerMember(c.Context(), int32(serverID), userID)
		if err != nil || !isMember {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "Private server"})
		}
	}
	err = h.Service.JoinServer(c.Context(), int32(serverID), userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
	}

	return c.SendStatus(fiber.StatusOK)
}

func RegisterServersRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	api.Post("/servers", handler.CreateServer)
	api.Get("/servers", handler.ListUserServers)
	api.Post("/servers/:id/join", handler.JoinServer)
}
