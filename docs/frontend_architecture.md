# Concord Frontend Architecture

This document defines the intended frontend structure for the React migration.

## Goals

- make the frontend easy to reason about for a backend-oriented developer
- reduce friction for AI-assisted implementation
- align the UI model with the backend domain model
- avoid duplicate navigation patterns

## Chosen UI Model

The product should follow a Discord-like three-column shell:

- left rail: servers and direct-message entry point
- middle sidebar: channels for the selected server
- main area: active chat view

The shell should also reserve a stable user-settings entry point, most likely in the lower area of the left side layout, so account-level actions do not need to be retrofitted later.

Possible later extension:

- right panel for channel info, member list, or thread details

This should become the single canonical navigation model.

## Why This Matters

The current frontend has tension between a flat channel-first approach and a server-aware approach. The React migration is the right time to remove that split and commit to one layout model.

## Recommended Stack

- React
- Vite
- React Router
- Tailwind CSS
- a small state solution first, such as Zustand, or a minimal React-context approach if the state remains simple

## Frontend Design Rules

- route structure should mirror product structure
- feature folders should be explicit
- API calls should be centralized by feature
- data fetching and presentation should stay reasonably separate
- global state should stay small and intentional

## Suggested Folder Shape

```text
frontend/web/
  src/
    app/
    components/
    features/
      auth/
      servers/
      channels/
      chat/
      dm/
      settings/
    layouts/
    routes/
    lib/
    styles/
```

## State Strategy

Keep global state limited to information that truly needs to be shared across the app.

Good global state:

- authenticated user
- auth tokens or session state
- currently selected server or channel when needed globally
- unread counters if shared across multiple panels

Keep local state local:

- form inputs
- modal visibility
- one-off loading states
- small view-only toggles

## Data Boundaries

Suggested ownership:

- auth feature owns login, register, session hydration, and logout
- servers feature owns server rail data and selection
- channels feature owns channel list for the current server
- chat feature owns message history, send flow, and WebSocket lifecycle
- dm feature should begin as a placeholder shell until the backend model is ready
- settings feature should begin as a placeholder route and later own profile and account-edit flows

## Routing Direction

The URL should make the current context obvious.

A likely direction:

- `/login`
- `/app/servers/:serverId/channels/:channelId`
- `/app/dm/:conversationId`
- `/app/settings`

If DMs are not ready yet, the direct-message button can lead to a placeholder route instead of being omitted from the layout.

## API Layer

Avoid scattering fetch logic directly through many components.

Prefer:

- one small API module per feature
- shared HTTP client setup in one place
- feature hooks or controllers that adapt API responses for UI use

## Realtime Strategy

The chat feature should own WebSocket connection lifecycle.

Responsibilities:

- connect when a channel view becomes active
- load initial message history
- append incoming messages
- handle reconnect states
- support optimistic sending later

## Migration Principle

Do not port every existing Vue screen as-is.

Instead:

1. keep the domain concepts
2. keep the useful UX structure
3. discard confusing frontend structure
4. rebuild the UI shell around one clear navigation model

## Success Criteria

The migrated frontend is successful if:

- there is one obvious place for server navigation
- there is one obvious place for channel navigation
- a new contributor can follow state and route flow without guessing
- backend concepts map cleanly to frontend features
