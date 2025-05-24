package websocket

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"

	. "github.com/andrelcunha/Concord/backend/internal/common"
	"github.com/redis/go-redis/v9"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
)

type Handler struct {
	service   *Service
	Clients   map[string]map[*websocket.Conn]bool
	ClientsMu sync.RWMutex
	PubSubs   map[string]*redis.PubSub
	PubSubsMu sync.RWMutex
}

type WSMessage struct {
	Content string `json:"content"`
}

func NewHandler(service *Service) *Handler {
	return &Handler{
		service: service,
		Clients: make(map[string]map[*websocket.Conn]bool),
		PubSubs: make(map[string]*redis.PubSub),
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

	username, ok := c.Locals("username").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid username"})
	}

	return websocket.New(func(conn *websocket.Conn) {
		channelIDStr := fmt.Sprintf("%d", channelID)

		h.ClientsMu.Lock()
		if h.Clients[channelIDStr] == nil {
			h.Clients[channelIDStr] = make(map[*websocket.Conn]bool)
		}
		h.Clients[channelIDStr][conn] = true
		h.ClientsMu.Unlock()

		h.PubSubsMu.Lock()
		if h.PubSubs[channelIDStr] == nil {
			h.PubSubs[channelIDStr] = h.service.redis.Subscribe(context.Background(), "channel:"+channelIDStr)
			go func(pubsub *redis.PubSub, channelIDStr string) {
				for msg := range pubsub.Channel() {
					h.ClientsMu.RLock()
					for client := range h.Clients[channelIDStr] {
						if err := client.WriteMessage(websocket.TextMessage, []byte(msg.Payload)); err != nil {
							log.Printf("Error writing message: %v", err)
						}
					}
					h.ClientsMu.RUnlock()
				}
			}(h.PubSubs[channelIDStr], channelIDStr)
		}
		h.PubSubsMu.Unlock()

		defer func() {
			h.ClientsMu.Lock()
			delete(h.Clients[channelIDStr], conn)
			if len(h.Clients[channelIDStr]) == 0 {
				delete(h.Clients, channelIDStr)
				h.PubSubsMu.Lock()
				if h.PubSubs[channelIDStr] != nil {
					h.PubSubs[channelIDStr].Close()
					delete(h.PubSubs, channelIDStr)
				}
				h.PubSubsMu.Unlock()
			}
			h.ClientsMu.Unlock()
			conn.Close()
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

			dbMessage, err := h.service.StoreMessage(context.Background(), int32(channelID), userID, string(wsMsg.Content), username)
			if err != nil {
				log.Printf("Error storing message: %v", err)
				continue
			}

			messageResponse := MessageResponse{
				ID:        dbMessage.ID,
				ChannelID: dbMessage.ChannelID,
				UserID:    dbMessage.UserID,
				Content:   dbMessage.Content,
				Username:  dbMessage.Username,
				CreatedAt: dbMessage.CreatedAt.Time.Format("2006-01-02T15:04:05Z07:00"),
			}
			messageJSON, err := json.Marshal(messageResponse)
			if err != nil {
				log.Printf("Error marshaling message: %v", err)
				continue
			}

			if err := h.service.BroadcastMessage(context.Background(), int32(channelID), userID, messageJSON); err != nil {
				log.Printf("Error broadcasting message: %v", err)
			}
		}

	})(c)
}

func RegisterWebSocketRoutes(api fiber.Router, service *Service) {
	handler := NewHandler(service)
	api.Get("/ws", handler.HandleConnection)
}
