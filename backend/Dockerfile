# backend/Dockerfile
FROM golang:1.24-alpine AS builder

RUN apk add --no-cache make git gcc g++

ENV CGO_ENABLED 1

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN make build

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/bin/backend .

EXPOSE 3000

CMD ["./backend"]
