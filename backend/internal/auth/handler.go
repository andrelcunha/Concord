package auth

import "github.com/gofiber/fiber/v2"

type Handler struct {
	service *Service
}

func NewHandler(service *Service) *Handler {
	return &Handler{service: service}
}

func (h *Handler) Register(c *fiber.Ctx) error {
	return c.SendString("Register")
}

func (h *Handler) Login(c *fiber.Ctx) error {
	return c.SendString("Login")
}
