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
- Zustand
- Axios-based API client

Sprint 0 stack decisions locked:

- use React with Vite as the frontend foundation
- use React Router for navigation
- use Tailwind CSS for styling
- use Zustand for small shared app state
- use Axios for the HTTP client layer
- do not introduce Redux in the initial migration
- do not introduce TanStack Query in the initial migration
- do not adopt a heavy component library in the initial migration

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

State rules locked in Sprint 0:

- route state should be the source of truth for selected server, selected channel, selected DM conversation, and current screen
- Zustand should hold only truly shared state such as auth/session and later lightweight shared UI data
- component-local state should remain the default for forms and small UI interactions

## Data Boundaries

Suggested ownership:

- auth feature owns login, register, session hydration, and logout
- servers feature owns server rail data and selection
- channels feature owns channel list for the current server
- chat feature owns message history, send flow, and WebSocket lifecycle
- dm feature should begin as a placeholder shell until the backend model is ready
- settings feature should begin as a placeholder route and later own profile and account-edit flows

The default backend and frontend assumption should be that DMs reuse the chat domain model wherever practical. A DM can be treated as a restricted conversation context rather than a separate messaging system, unless later product needs justify divergence.

## Routing Direction

The URL should make the current context obvious.

The canonical route model is:

- `/login`
- `/register`
- `/app`
- `/app/servers/:serverId/channels/:channelId`
- `/app/dm`
- `/app/dm/:conversationId`
- `/app/settings`

Routing decisions locked in Sprint 0:

- login and register should be separate routes rather than one toggled auth screen
- all authenticated product surfaces should live under `/app`
- server and channel selection should be encoded in the URL
- DMs should have their own route branch even if they reuse the same chat architecture
- settings should be a first-class route, not only a modal concept

Redirect and fallback behavior:

- `/` should redirect to `/login` when unauthenticated
- `/` should redirect to a safe in-app destination when authenticated
- `/app` should render a stable shell and then show either the last active context or an intentional empty state
- `/app/dm` can be a placeholder route before real DM conversations exist
- invalid server or channel URLs should render an in-shell unavailable state rather than ejecting the user from the app

## API Layer

Avoid scattering fetch logic directly through many components.

Prefer:

- one small API module per feature
- shared HTTP client setup in one place
- feature hooks or controllers that adapt API responses for UI use

The initial migration should prefer a simple API layer over heavier server-state frameworks. If server-state complexity grows later, that decision can be revisited deliberately.

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
