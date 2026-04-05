package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/andrelcunha/Concord/backend/config"
	"github.com/andrelcunha/Concord/backend/internal/auth"
	"github.com/andrelcunha/Concord/backend/internal/blocks"
	"github.com/andrelcunha/Concord/backend/internal/channels"
	"github.com/andrelcunha/Concord/backend/internal/dms"
	"github.com/andrelcunha/Concord/backend/internal/friendships"
	"github.com/andrelcunha/Concord/backend/internal/messages"
	"github.com/andrelcunha/Concord/backend/internal/middleware"
	"github.com/andrelcunha/Concord/backend/internal/servers"
	"github.com/andrelcunha/Concord/backend/internal/websocket"
	"github.com/avast/retry-go/v4"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func main() {
	cfg := config.LoadConfig()

	dbPool := initilizeDatabase(cfg)
	defer dbPool.Close()

	redisClient := initializeRedis(cfg)
	defer redisClient.Close()

	app := initializeFiber()
	secret := cfg.SecretKey

	// Initialize auth service
	authRepo := auth.NewRepository(dbPool)
	authService := auth.NewService(authRepo, redisClient, secret)
	auth.RegisterAuthRoutes(app, authService)

	api := AddProtectedRoutes(app, secret)

	// Initialize servers service
	serversRepo := servers.NewRepository(dbPool)
	serversService := servers.NewService(serversRepo)
	servers.RegisterServersRoutes(api, serversService)

	// Initialize channels service
	channelsService := channels.NewService(channels.NewRepository(dbPool), serversRepo)
	channels.RegisterChannelsRoutes(api, channelsService)

	// Initialize blocks service
	blocksRepo := blocks.NewRepository(dbPool)
	blocksService := blocks.NewService(blocksRepo)
	blocks.RegisterBlockRoutes(api, blocksService)

	// Initialize friendships service
	friendshipsRepo := friendships.NewRepository(dbPool)
	friendshipsService := friendships.NewService(friendshipsRepo, blocksRepo)
	friendships.RegisterFriendshipRoutes(api, friendshipsService)

	// Initialize direct messages service
	dmRepo := dms.NewRepository(dbPool)
	dmService := dms.NewService(dmRepo, friendshipsRepo, blocksRepo, redisClient)
	dms.RegisterDmRoutes(api, dmService)
	dms.RegisterDmWebSocketRoutes(api, dmService)

	// Initialize websocket service
	msgRepo := messages.NewRepository(dbPool)
	websocketService := websocket.NewService(msgRepo, redisClient)
	websocket.RegisterWebSocketRoutes(api, websocketService)

	// Initialize Message service
	messageService := messages.NewService(msgRepo)
	messages.RegisterMessageRoutes(api, messageService)

	addCustom404Handler(app)
	// Start server
	log.Fatal(app.Listen(fmt.Sprintf(":%d", cfg.Port)))
}

func initilizeDatabase(cfg config.Config) *pgxpool.Pool {
	dbPool, err := pgxpool.New(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v\n", err)
	}
	return dbPool
}

func initializeRedis(cfg config.Config) *redis.Client {

	opt, err := redis.ParseURL(cfg.RedisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v\n", err)
	}
	// retry 3 times
	redisClient := redis.NewClient(opt)
	err = retry.Do(
		func() error {
			if err := redisClient.Ping(context.Background()).Err(); err != nil {
				log.Printf("Failed to connect to Redis: %v\n", err)
				log.Println("Retrying...")
				return err
			}
			log.Println("Connected to Redis")
			return nil
		},
		retry.Attempts(3),
		retry.Delay(1*time.Second),
	)
	if err != nil {
		log.Fatalf("Failed to connect to Redis after 3 attempts: %v\n", err)
	}
	return redisClient
}

func initializeFiber() *fiber.App {
	config := fiber.Config{

		Prefork: false,
		AppName: "Concord",
		// Views:                 engine,
		ViewsLayout: "layout",
		// DisableStartupMessage: true,
	}
	app := fiber.New(config)
	app.Use(middleware.CORSMiddleware())
	app.Use(logger.New(logger.Config{
		Output: os.Stdout, // TODO: Change this to a logger
	}))
	return app
}

func addCustom404Handler(app *fiber.App) {
	app.Use(func(ctx *fiber.Ctx) error {
		return ctx.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"code":    fiber.StatusNotFound,
			"message": "Route not found",
		})
	})
}

func AddProtectedRoutes(app *fiber.App, secret string) fiber.Router {
	protected := app.Group("/api", middleware.Auth(secret))
	// protected.Get("/profile", func(ctx *fiber.Ctx) error {
	// 	userID := ctx.Locals("userID").(string)
	// 	return ctx.JSON(fiber.Map{"username": userID})
	// })
	return protected
}
