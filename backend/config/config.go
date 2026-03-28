package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	SecretKey   string
	DatabaseURL string
	RedisURL    string
	Port        int
}

func LoadConfig() Config {
	loadDotEnv()

	return Config{
		SecretKey:   getEnv("SECRET_KEY", "change-me-in-production"),
		DatabaseURL: getEnv("DATABASE_URL", "postgresql://postgres:root@localhost:5432/concord"),
		RedisURL:    getEnv("REDIS_URL", "redis://localhost:6379/0"),
		Port:        getEnvAsInt("PORT", 3000),
	}
}

func loadDotEnv() {
	if err := godotenv.Load(); err != nil {
		log.Printf("config: no .env file loaded: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}

	value, err := strconv.Atoi(valueStr)
	if err != nil {
		log.Printf("config: invalid value for %s=%q, using default %d", key, valueStr, defaultValue)
		return defaultValue
	}

	return value
}
