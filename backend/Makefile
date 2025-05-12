VERSION=$(shell git describe --tags --always)
BINARY_NAME=backend
BUILD_DIR=bin

build: 
	@mkdir -p $(BUILD_DIR)
	@go build -ldflags "-X main.version=$(VERSION)" -o ./$(BUILD_DIR)/$(BINARY_NAME) ./cmd/api/main.go


run: build
	@./$(BUILD_DIR)/$(BINARY_NAME)

clean:
	@rm -f $(BUILD_DIR)/$(BINARY_NAME)

.PHONY: build clean run 
