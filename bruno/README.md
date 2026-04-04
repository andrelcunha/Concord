# Concord Bruno Collection

This collection mirrors the currently wired backend routes in `backend/cmd/api/main.go`.

## Quick start

1. Open the `bruno/` folder in Bruno.
2. Select the `local` environment.
3. Run `Auth/Login`, then copy the returned tokens into the environment variables.
4. Use the protected requests under `Servers`, `Channels`, and `Messages`.

## Environment variables

- `baseUrl`: backend HTTP URL
- `accessToken`: bearer token for `/api` routes
- `refreshToken`: refresh token for `/refresh`
- `serverId`: sample server ID for channel operations
- `channelId`: sample channel ID for message history

## Notes

- Channel list and channel creation require `server_id`.
- WebSocket chat is exposed at `/api/ws` and expects both `channel_id` and auth. I left that out of the first scaffold because the HTTP requests are the most useful baseline in Bruno.
