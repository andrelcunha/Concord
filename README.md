# Concord
[![Go](https://github.com/andrelcunha/OtterMq/actions/workflows/go.yml/badge.svg)](https://github.com/andrelcunha/OtterMq/actions/workflows/go.yml)

A **Discord-like real-time chat** platform built with **Go**, **Vue**, and **Quasar**, designed for learning and experimentation.

## Why Concord?
- Inspired by **Discord**, but built from scratch for educational purposes.
- Named after the **Concorde**, the supersonic jet, emphasizing speed and real-time communication.
- A nod to **Concórdia, Brazil**, where the project originates.

## Tech Stack
- **Backend:** Go (Fiber/Gin), Gorilla WebSocket, PostgreSQL, Redis
- **Frontend:** Vue 3, Quasar, Pinia, TailwindCSS
- **Testing:** Vitest, Cypress
- **Deployment:** Docker + AWS (planned)

## Planned Features
- Real-time messaging via WebSockets  
- Authentication with JWT  
- Channel-based discussions  
- Rich text formatting & reactions  
- Future: Voice and video calls with WebRTC  

## Setup

### Backend
```bash
# Clone the repo
git clone https://github.com/yourusername/concord.git && cd concord/backend

# Install dependencies
go mod tidy

# Run the server
go run cmd/api/main.go
```

### Frontend
```bash
cd ../frontend
npm install
npm run dev
```

## Roadmap
1. Implement basic authentication (user login/signup)
1. Set up WebSocket real-time messaging
1. Build UI components and state management
1. Optimize performance and add Redis pub/sub

## Contribution
This project is meant for learning, but feel free to give feedback or suggest improvements.
