# Direct Messages And Friendship Plan

## Summary

Build a full DM system with explicit friendships, friend requests, blocks, DM conversations, DM messages, and DM-specific sidebar/detail surfaces. The first release will require an accepted friendship before starting a DM, support hiding conversations per user, keep existing DM history after unfriending, and use username search for friend discovery. Blocking will be a separate model and, by default, will be a soft block: it prevents new friend/DM creation paths but does not aggressively alter existing DM behavior beyond eligibility checks.

## Backend Model

### Domain and schema

- Add `friendships` table with:
  - `id`
  - `user_id`
  - `friend_id`
  - `status` (`pending`, `accepted`, `rejected`)
  - `created_at`
  - uniqueness on the normalized pair and enforcement of `user_id < friend_id`
- Add `blocks` table as a separate directional model:
  - `id`
  - `blocker_id`
  - `blocked_id`
  - `created_at`
  - uniqueness on `(blocker_id, blocked_id)`
- Add DM-specific tables instead of reusing server channels:
  - `dm_conversations`
  - `dm_conversation_participants`
  - `dm_messages`
  - `dm_conversation_visibility` or equivalent per-user hidden-state table so `x` hides a DM only for that viewer
- Keep server channels and server messages unchanged; DM data is parallel, not merged into current `channels/messages`.

### Backend behavior

- Friendship lifecycle:
  - send friend request
  - list incoming/outgoing requests
  - accept request
  - reject request
  - remove friend
- Discovery:
  - username search endpoint for finding users to friend
  - exclude self, blocked users, and already-related users where appropriate
- DM lifecycle:
  - list DM conversations visible to current user
  - create-or-get DM with an accepted friend
  - hide DM conversation for current user only
  - load DM message history
  - send/receive DM messages live
- Block behavior for v1:
  - block is stored separately
  - blocked users should not appear in friend discovery or new-DM creation flows
  - future behavior can be tightened later, but v1 keeps it soft rather than auto-deleting or force-hiding old threads
- Unfriend behavior for v1:
  - existing DM conversation remains available
  - starting a brand-new DM still requires friendship
  - if an old DM already exists, it stays usable unless later blocked-policy changes say otherwise

## Frontend Behavior

- Left rail:
  - existing DM entry remains the gateway into the DM product area
- Channel/sidebar replacement on DM route:
  - header becomes `Direct Messages` with a `+`
  - `+` opens "start conversation" flow using accepted friends not already shown
  - list shows active DM conversations
  - hovering a DM row reveals `x` to hide that conversation for the current user
- DM conversation page:
  - center chat area reuses current chat patterns for history, skeletons, composer, and websocket updates
  - right column shows summarized profile:
    - avatar
    - display name line
    - username line
    - member-since date
    - collapsible mutual servers section
    - collapsible mutual friends section
  - top-of-thread header includes:
    - mutual server icons
    - `N Mutual Servers`
    - `Remove Friend`
    - `Block`
- Friend system UI:
  - username search to send requests
  - request acceptance/rejection surface
  - DM creation only for accepted friends
- Reuse:
  - collapsible group behavior should remain reusable for future sidebar/profile sections such as voice channels or mutual-lists

## API / Realtime Changes

- Protected friend APIs:
  - search users
  - send request
  - list requests
  - accept request
  - reject request
  - remove friend
  - list accepted friends
- Protected block APIs:
  - block user
  - unblock user
  - list blocked users if needed by UI
- Protected DM APIs:
  - list conversations
  - create-or-get conversation with friend
  - hide conversation for self
  - list conversation messages
  - mutual servers for conversation partner
  - mutual friends for conversation partner
- Websocket/API transport:
  - DM websocket endpoint or websocket mode that accepts `conversation_id`
  - DM message response shape should mirror current chat payloads closely to maximize frontend reuse
  - reuse the existing JWT auth approach and Redis fanout pattern, but with DM-specific pub/sub keys

## Test Plan

- Migrations apply cleanly from current schema.
- Friendship pair normalization always enforces `user_id < friend_id`.
- Duplicate friend requests and duplicate accepted friendships are rejected correctly.
- Accepted friends can create/get exactly one DM conversation per pair.
- Non-friends cannot start new DM conversations.
- Hidden conversations disappear only for the acting user and reappear only according to chosen visibility rules.
- Removing a friend does not destroy existing DM history.
- Blocking prevents friend discovery / new DM initiation according to the chosen soft-block policy.
- DM message history loads correctly and live DM messaging works between two users.
- Frontend DM sidebar:
  - shows conversations
  - supports hide via `x`
  - starts a conversation from `+`
- DM detail panel renders profile, member-since, mutual servers, and mutual friends.
- Existing server/channel chat flows continue working unchanged.
- Frontend production build and backend tests/build pass.

## Locked Assumptions

- Friendship requests are in scope for v1; `status` is real, not placeholder.
- DM creation requires an accepted friendship.
- User discovery for friend requests is username search.
- Hiding a DM is per-user only and does not delete history.
- Removing a friend keeps existing DM conversations available.
- Block is modeled separately and is soft in v1:
  - it affects discovery and new-relationship creation first
  - it does not force-delete or hard-hide old threads in this sprint
- DM storage and transport remain separate from server channels/messages to avoid muddying the current server-scoped domain.
