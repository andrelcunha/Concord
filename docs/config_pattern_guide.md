---
title: Config Pattern Guide
---

# Config Pattern Guide

This document explains the configuration pattern used in OtterMQ so it can be reused in other Go projects.

The goal of the pattern is simple:

- keep configuration centralized
- support both `.env` files and real environment variables
- start safely even when variables are missing
- fall back cleanly when typed values are invalid
- make behavior easy to test

## Why This Pattern Works

OtterMQ keeps all startup configuration in one package: [`config/config.go`](../config/config.go).

That package is responsible for:

- loading `.env` as a convenience layer
- reading process environment variables
- applying defaults for missing values
- converting strings into typed fields like `bool`, `int`, `uint16`, `uint32`, and `time.Duration`
- warning when a value is invalid and falling back to a safe default

This keeps the rest of the application simple. Other packages receive a ready-to-use `Config` struct instead of reading environment variables directly.

## Architecture

The pattern has four layers:

1. A `Config` struct defines all application settings in one place.
2. A `LoadConfig` function builds that struct during startup.
3. Small helper functions handle string-to-type conversion and fallback behavior.
4. Tests verify defaults, overrides, and invalid-input handling.

In OtterMQ, the startup flow is:

1. `main()` calls `config.LoadConfig(...)`
2. `LoadConfig` tries to load `.env`
3. each config field is resolved with a helper such as `getEnv`, `getEnvAsBool`, or `getEnvAsDuration`
4. the rest of the app uses the populated struct

## Configuration Priority

OtterMQ follows this precedence:

1. built-in defaults
2. `.env` file
3. real environment variables

That comes from two choices in [`config/config.go`](../config/config.go):

- `godotenv.Load()` loads `.env` into the process only if a variable is not already set
- each helper falls back to a default when the variable is missing or unusable

This is a strong default for local development and containers:

- developers can use `.env` locally
- CI/CD and production can inject real environment variables
- production overrides win without editing files

## How Missing Variables Are Handled

Missing values are not treated as fatal in this design.

Instead:

- string settings fall back to a default via `getEnv`
- numeric, boolean, and duration settings fall back via typed helpers
- the application can still boot with a complete config object

Example:

```go
BrokerPort: getEnv("OTTERMQ_BROKER_PORT", "5672"),
EnableUI:   getEnvAsBool("OTTERMQ_ENABLE_UI", true),
WindowSize: getEnvAsDuration("OTTERMQ_METRICS_WINDOW_SIZE", 5*time.Minute),
```

This gives the project a fail-soft startup model. Missing configuration does not crash the app unless a project explicitly chooses to add validation on top.

## How Invalid Values Are Handled

Invalid typed values also do not stop startup.

Instead, the helper:

1. reads the raw environment value
2. attempts to parse it
3. prints a warning if parsing fails
4. returns the default value

Example behavior:

- `OTTERMQ_SSL=maybe` becomes `false`
- `OTTERMQ_CHANNEL_MAX=not-a-number` becomes `2048`
- `OTTERMQ_METRICS_WINDOW_SIZE=abc` becomes `5m`

This is especially useful in development environments where configuration mistakes are common and fast feedback is better than a hard crash.

## Example Helper Shape

OtterMQ uses a family of small helpers instead of one large generic loader.

Example:

```go
func getEnvAsInt(key string, defaultValue int) int {
	valueStr := os.Getenv(key)
	if valueStr == "" {
		return defaultValue
	}
	value, err := strconv.Atoi(valueStr)
	if err != nil {
		fmt.Printf("Warning: Invalid value for %s: %s, using default: %d\n", key, valueStr, defaultValue)
		return defaultValue
	}
	return value
}
```

This style is easy to read, easy to debug, and easy to extend.

## Why Centralization Matters

A common problem in Go services is reading environment variables across many packages. That creates hidden dependencies and inconsistent fallback rules.

OtterMQ avoids that by centralizing configuration:

- all env keys live in one package
- all defaults live in one package
- all parsing rules live in one package
- all callers depend on typed config fields, not raw env access

This makes refactoring safer and helps documentation stay accurate.

## Reusable Rules For Another Go Project

If you want to copy this pattern into another project, keep these rules:

- create one `config` package
- define one exported `Config` struct
- expose one `LoadConfig` function
- keep env parsing inside that package only
- use small typed helper functions
- always provide a default unless the setting is truly mandatory
- warn on invalid values instead of silently ignoring them
- test defaults, overrides, and invalid input paths

## Suggested Project Skeleton

```text
your-project/
  cmd/yourapp/main.go
  config/config.go
  config/config_test.go
  .env.example
```

Recommended startup flow:

```go
func main() {
	cfg := config.LoadConfig(version)
	app := bootstrap(cfg)
	app.Run()
}
```

## When To Keep Fail-Soft Defaults

This pattern is a very good fit for:

- local development
- internal tools
- services with sensible defaults
- projects where startup ergonomics matter
- apps that can run safely in a default mode

## When To Add Strict Validation

For another project, you may want to keep this loader but add a validation step after loading if some values are truly required.

A good split is:

- loading handles defaults and type conversion
- validation handles business-critical requirements

Example cases for validation:

- `JWT_SECRET` must not use a development default in production
- `DATABASE_URL` must be present when a database-backed mode is enabled
- `PORT` must be within an allowed range

That means you can preserve the clean loader design while still enforcing stricter production rules where needed.

## Testing Strategy

OtterMQ already tests this pattern in [`config/config_test.go`](../config/config_test.go).

The current tests cover:

- default values when nothing is set
- environment overrides
- fallback behavior for invalid values
- boundary handling for `OTTERMQ_MAX_PRIORITY`

This is one of the strongest parts of the design because configuration code often looks simple but breaks easily over time.

For another project, copy this test structure:

- one test for pure defaults
- one test for explicit env overrides
- one test for invalid values
- one table-driven test for boundary-sensitive fields

## Practical Strengths Of This Approach

- startup code stays simple
- local onboarding is easy
- defaults are explicit
- behavior is predictable
- the application is resilient to partial configuration
- config changes are easy to document

## Practical Tradeoffs

A few tradeoffs are worth noting if you reuse the pattern:

- warnings currently go to standard output via `fmt.Printf`, not the app logger
- missing required secrets are not rejected automatically
- defaults must be curated carefully so they are safe in production

Those are not design failures, just choices. For many services, the right next step is to keep this loader and add a separate `Validate()` method.

## Recommended Template For Another Project

If you want a direct rule to follow, use this:

1. Load `.env` opportunistically.
2. Resolve every setting through a helper with a default.
3. Parse into typed config fields immediately.
4. Warn and fall back on malformed input.
5. Validate only the truly mandatory or dangerous settings after loading.
6. Pass the final `Config` struct through dependency injection.

That gives you the same developer-friendly behavior OtterMQ has now, while leaving room for stricter production checks when your other project needs them.
