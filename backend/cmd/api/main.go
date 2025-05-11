package main

import (
	"context"
	"log"
	"os"

	"github.com/andrelcunha/Concord/backend/config"
	"github.com/andrelcunha/Concord/backend/internal/auth"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

func main() {
	dbPool := initilizeDatabase()
	defer dbPool.Close()

	redisClient := initializeRedis()
	defer redisClient.Close()

	app := initializeFiber()

	// Initialize auth service
	authRepo := auth.NewRepository(dbPool)
	authService := auth.NewService(authRepo, redisClient)
	authHandler := auth.NewHandler(authService)

	// Routes
	addRoutes(app, authHandler)

	// Start server
	log.Fatal(app.Listen(":3000"))
}

func addRoutes(app *fiber.App, authHandler *auth.Handler) {
	api := app.Group("/api")
	addAuthRoutes(api, authHandler)
	addCustom404Handler(app)
}

func initilizeDatabase() *pgxpool.Pool {
	databaseURL := config.Config("DATABASE_URL")
	dbPool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v\n", err)
	}
	return dbPool
}

func initializeRedis() *redis.Client {
	redisURL := config.Config("REDIS_URL")
	redisClient := redis.NewClient(&redis.Options{
		Addr: redisURL,
	})
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

func addAuthRoutes(api fiber.Router, authHandler *auth.Handler) {
	api.Post("/register", authHandler.Register)
	api.Post("/login", authHandler.Login)
}
