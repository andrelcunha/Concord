package dms

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"sync"

	"github.com/gofiber/fiber/v2"
	ws "github.com/gofiber/websocket/v2"
	"github.com/redis/go-redis/v9"
)

type WebSocketHandler struct {
	service   *Service
	Clients   map[string]map[*ws.Conn]bool
	ClientsMu sync.RWMutex
	PubSubs   map[string]*redis.PubSub
	PubSubsMu sync.RWMutex
}

type dmWSMessage struct {
	Content string `json:"content"`
}

type dmWSResponse struct {
	ID             int32  `json:"id"`
	ConversationID int32  `json:"conversation_id"`
	UserID         int32  `json:"user_id"`
	Content        string `json:"content"`
	Username       string `json:"username"`
	CreatedAt      string `json:"created_at"`
	AvatarURL      string `json:"avatar_url"`
	AvatarColor    string `json:"avatar_color"`
}

func NewWebSocketHandler(service *Service) *WebSocketHandler {
	return &WebSocketHandler{
		service: service,
		Clients: make(map[string]map[*ws.Conn]bool),
		PubSubs: make(map[string]*redis.PubSub),
	}
}

func (h *WebSocketHandler) HandleConnection(c *fiber.Ctx) error {
	conversationIDStr := c.Query("conversation_id")
	if conversationIDStr == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "conversation_id is required"})
	}

	conversationID, err := strconv.Atoi(conversationIDStr)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid conversation_id"})
	}

	userID, ok := c.Locals("userID").(int32)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}

	username, ok := c.Locals("username").(string)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid username"})
	}
	avatarURL, _ := c.Locals("avatar_url").(string)
	avatarColor, _ := c.Locals("avatar_color").(string)

	if _, err := h.service.repo.GetDmConversationParticipant(c.Context(), int32(conversationID), userID); err != nil {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": ErrDmForbidden.Error()})
	}

	return ws.New(func(conn *ws.Conn) {
		key := fmt.Sprintf("%d", conversationID)

		h.addClient(key, conn)
		h.setupPubSub(key)

		defer func() {
			h.ClientsMu.Lock()
			delete(h.Clients[key], conn)
			if len(h.Clients[key]) == 0 {
				delete(h.Clients, key)
				h.closePubSub(key)
			}
			h.ClientsMu.Unlock()
			conn.Close()
		}()

		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				log.Printf("DM read error: %v", err)
				break
			}

			var wsMsg dmWSMessage
			if err := json.Unmarshal(msg, &wsMsg); err != nil {
				log.Printf("DM unmarshal error: %v", err)
				continue
			}
			if wsMsg.Content == "" {
				continue
			}

			stored, err := h.service.StoreMessage(context.Background(), userID, int32(conversationID), wsMsg.Content)
			if err != nil {
				log.Printf("DM store error: %v", err)
				continue
			}

			payload, err := json.Marshal(dmWSResponse{
				ID:             stored.ID,
				ConversationID: stored.ConversationID,
				UserID:         stored.UserID,
				Content:        stored.Content,
				Username:       username,
				CreatedAt:      stored.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
				AvatarURL:      avatarURL,
				AvatarColor:    avatarColor,
			})
			if err != nil {
				log.Printf("DM marshal error: %v", err)
				continue
			}

			if err := h.service.BroadcastMessage(context.Background(), int32(conversationID), payload); err != nil {
				log.Printf("DM broadcast error: %v", err)
			}
		}
	})(c)
}

func RegisterDmWebSocketRoutes(api fiber.Router, service *Service) {
	handler := NewWebSocketHandler(service)
	api.Get("/dms/ws", handler.HandleConnection)
}

func (h *WebSocketHandler) handlePubSubMessages(pubsub *redis.PubSub, key string) {
	for msg := range pubsub.Channel() {
		h.ClientsMu.RLock()
		for client := range h.Clients[key] {
			if err := client.WriteMessage(ws.TextMessage, []byte(msg.Payload)); err != nil {
				log.Printf("DM write error: %v", err)
			}
		}
		h.ClientsMu.RUnlock()
	}
}

func (h *WebSocketHandler) setupPubSub(key string) {
	h.PubSubsMu.Lock()
	if h.PubSubs[key] == nil {
		h.PubSubs[key] = h.service.redis.Subscribe(context.Background(), "dm:"+key)
		go h.handlePubSubMessages(h.PubSubs[key], key)
	}
	h.PubSubsMu.Unlock()
}

func (h *WebSocketHandler) closePubSub(key string) {
	h.PubSubsMu.Lock()
	if h.PubSubs[key] != nil {
		h.PubSubs[key].Close()
		delete(h.PubSubs, key)
	}
	h.PubSubsMu.Unlock()
}

func (h *WebSocketHandler) addClient(key string, conn *ws.Conn) {
	h.ClientsMu.Lock()
	if h.Clients[key] == nil {
		h.Clients[key] = make(map[*ws.Conn]bool)
	}
	h.Clients[key][conn] = true
	h.ClientsMu.Unlock()
}
