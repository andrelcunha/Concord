package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Handler struct {
	service   *Service
	Clients   map[string]map[*websocket.Conn]bool
	ClientsMu sync.RWMutex
}

type WSMessage struct {
	Content string `json:"content"`
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
		Clients: make(map[string]map[*websocket.Conn]bool),
	}
}

func (h *Handler) HandleConnection(c *fiber.Ctx) error {
	channelIDStr := c.Query("channel_id")
	if channelIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "channel_id is required"})
	}

	channelID, err := strconv.Atoi(channelIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid channel_id"})
	}

	userID, ok := c.Locals("userID").(int32)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	return websocket.New(func(conn *websocket.Conn) {
		channelIDStr := fmt.Sprintf("%d", channelID)

		h.ClientsMu.Lock()
		if h.Clients[channelIDStr] == nil {
			h.Clients[channelIDStr] = make(map[*websocket.Conn]bool)
		}
		h.Clients[channelIDStr][conn] = true
		h.ClientsMu.Unlock()

		defer func() {
			h.ClientsMu.Lock()
			delete(h.Clients[channelIDStr], conn)
			if len(h.Clients[channelIDStr]) == 0 {
				delete(h.Clients, channelIDStr)
			}
			h.ClientsMu.Unlock()
			conn.Close()
		}()

		pubsub := h.service.redis.Subscribe(context.Background(), "channel:"+channelIDStr)
		defer pubsub.Close()

		go func() {
			for msg := range pubsub.Channel() {
				h.ClientsMu.RLock()
				for client := range h.Clients[channelIDStr] {
					if err := client.WriteMessage(websocket.TextMessage, []byte(msg.Payload)); err != nil {
						log.Printf("Error writing message: %v", err)

					}
				}
				h.ClientsMu.RUnlock()
			}
		}()

		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				log.Printf("Error reading message: %v", err)
				break
			}

			var wsMsg WSMessage
			if err := json.Unmarshal(msg, &wsMsg); err != nil {
				log.Printf("Unmarshal error: %v", err)
				continue
			}

			if wsMsg.Content == "" {
				continue
			}

			dbMessage, err := h.service.StoreMessage(context.Background(), int32(channelID), userID, string(wsMsg.Content))
			if err != nil {
				log.Printf("Error storing message: %v", err)
				continue
			}

			if err := h.service.BroadcastMessage(context.Background(), int32(channelID), userID, dbMessage); err != nil {
				log.Printf("Error broadcasting message: %v", err)
			}
		}

	})(c)
}

func RegisterWebSocketRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	api.Get("/ws", handler.HandleConnection)
}
