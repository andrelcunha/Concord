package config

import "testing"

func TestLoadConfigDefaults(t *testing.T) {
	t.Setenv("SECRET_KEY", "")
	t.Setenv("DATABASE_URL", "")
	t.Setenv("REDIS_URL", "")
	t.Setenv("PORT", "")

	cfg := LoadConfig()

	if cfg.SecretKey != "change-me-in-production" {
		t.Fatalf("expected default secret key, got %q", cfg.SecretKey)
	}
	if cfg.DatabaseURL != "postgresql://postgres:root@localhost:5432/concord" {
		t.Fatalf("expected default database url, got %q", cfg.DatabaseURL)
	}
	if cfg.RedisURL != "redis://localhost:6379/0" {
		t.Fatalf("expected default redis url, got %q", cfg.RedisURL)
	}
	if cfg.Port != 3000 {
		t.Fatalf("expected default port 3000, got %d", cfg.Port)
	}
}

func TestLoadConfigEnvOverrides(t *testing.T) {
	t.Setenv("SECRET_KEY", "super-secret")
	t.Setenv("DATABASE_URL", "postgresql://db-user:db-pass@db:5432/app")
	t.Setenv("REDIS_URL", "redis://cache:6379/1")
	t.Setenv("PORT", "8080")

	cfg := LoadConfig()

	if cfg.SecretKey != "super-secret" {
		t.Fatalf("expected secret override, got %q", cfg.SecretKey)
	}
	if cfg.DatabaseURL != "postgresql://db-user:db-pass@db:5432/app" {
		t.Fatalf("expected database override, got %q", cfg.DatabaseURL)
	}
	if cfg.RedisURL != "redis://cache:6379/1" {
		t.Fatalf("expected redis override, got %q", cfg.RedisURL)
	}
	if cfg.Port != 8080 {
		t.Fatalf("expected port override 8080, got %d", cfg.Port)
	}
}

func TestLoadConfigInvalidPortFallsBackToDefault(t *testing.T) {
	t.Setenv("PORT", "not-a-number")

	cfg := LoadConfig()

	if cfg.Port != 3000 {
		t.Fatalf("expected invalid port to fall back to 3000, got %d", cfg.Port)
	}
}
