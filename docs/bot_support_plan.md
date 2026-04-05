# Concord Bot Support Plan

This document turns the current bot-support discussion into a staged plan that fits Concord's current architecture and learning goals.

The intent is not to jump straight to a Discord-scale platform.

The intent is to add bot support in layers so each stage:

- keeps the app understandable
- teaches a clear lesson
- avoids locking Concord into a harder model too early

## Current Assessment

Bot support is possible in the current codebase, but it is not a small add-on.

The main reason is that Concord currently treats message authors as normal authenticated users:

- auth is built around human registration and password login
- protected routes and WebSocket auth assume JWTs representing users
- messages reference `users.id`
- message reads join back to `users` for username and avatar data

This means the easiest path is not to build a full bot platform first.

The easiest path is to first introduce bots as a special kind of actor inside the existing user-centered model.

## Guiding Product Decision

The recommended default is:

- Phase 1 and Phase 2 treat bots as first-party or owner-managed bot accounts
- later phases decide whether third-party developer bots are worth the additional complexity

This keeps the early work useful without requiring install flows, public developer APIs, permission scopes, slash commands, and marketplace-style UX from the start.

## Why This Needs Care

Before adding bots, Concord should tighten a few existing boundaries:

- channel access already checks server membership
- message history and WebSocket connection paths should also enforce channel or server access consistently
- message authorship should be modeled more intentionally instead of assuming every sender is a human account

If these foundations stay fuzzy, bot support will amplify that ambiguity instead of teaching the right lessons.

## Phase 0: Permission And Identity Cleanup

Goal:

- make the current chat model safe and explicit enough that bot support has a clean base

Suggested outcomes:

- message history verifies the requester is allowed to view the channel
- WebSocket connection verifies the requester is allowed to connect to the channel
- actor identity rules are documented clearly
- the project decides whether bots will be represented as special users or as a separate table

Recommended decision:

- start with bots as special users

Why:

- it matches the current schema and message model better
- it minimizes query churn in the first bot slice
- it keeps the first implementation easier to reason about

Suggested schema direction:

- add `users.is_bot`
- add `users.display_name` later only if the project wants bot names that differ from usernames
- keep message storage pointing at `users.id` for the early versions

Main lesson:

- identity and permissions should be made explicit before adding more actor types

## Phase 1: Internal Bot MVP

Goal:

- allow Concord itself to host simple bot users that can post messages

Scope:

- no public developer platform
- no bot marketplace
- no slash-command framework
- no untrusted code execution

Suggested outcomes:

- bots can exist as accounts in the database
- bots can authenticate without the human login form
- bots can post messages into allowed channels through a backend-controlled path
- bot messages render in the current UI without special frontend architecture changes

Recommended implementation shape:

1. add bot-aware user fields and token storage
2. create a bot credential issuance flow for local or owner-managed use
3. add a REST endpoint for bot message creation
4. reuse the existing message persistence and Redis broadcast path

Recommended constraint:

- bots post through REST first, not WebSocket first

Why:

- it is simpler to secure
- it is easier to test
- it avoids overloading the existing human live-chat connection model too early

Main lesson:

- Concord can support non-human actors without rebuilding the entire chat stack

## Phase 2: Bot Membership And Capability Rules

Goal:

- define where bots are allowed to exist and what they can do

Suggested outcomes:

- bots can be attached to specific servers
- bots can join servers through an explicit admin-controlled flow
- bot tokens are scoped to the bot account
- simple capability flags exist for actions like posting messages or reading events

Recommended scope rule:

- keep capabilities coarse at first

Examples:

- `can_post_messages`
- `can_read_messages`
- `can_connect_realtime`

Avoid early:

- full Discord-style permissions
- deeply nested role inheritance
- per-channel overrides unless they become necessary for a real learning goal

Main lesson:

- adding a second actor type forces clearer permission boundaries

## Phase 3: Event Consumption

Goal:

- let bots react to activity instead of only sending messages

Suggested outcomes:

- bots can consume message-created events
- the backend emits a stable internal event payload
- the project chooses whether bots consume events through polling, webhooks, or a bot WebSocket

Recommended order:

1. stable internal event shape
2. simple delivery mechanism
3. richer event set later

Recommended first delivery model:

- bot WebSocket or internal pub/sub consumer if the bot runtime is inside the Concord backend

Alternative:

- outgoing webhooks if the bot runtime is external

Main lesson:

- event design matters as much as write APIs in realtime systems

## Phase 4: Basic Command Framework

Goal:

- support simple useful bot interactions inside channels

Suggested outcomes:

- bots can respond to message prefixes or mention patterns
- command parsing is centralized enough to avoid ad hoc handlers everywhere
- command execution failures are visible and debuggable

Keep it simple:

- start with message-based commands
- defer slash-command style UX until the product has a stronger interaction model

Main lesson:

- commands are a product and architecture problem, not just a parser problem

## Phase 5: Third-Party Developer Platform Decision

Goal:

- explicitly decide whether Concord should stop at owner-managed bots or continue toward a developer platform

Decision checkpoint:

- if the learning goal is mostly internal architecture, stop after the earlier phases
- if the learning goal is ecosystem design, continue into third-party bot support

If continuing, new work likely includes:

- bot application records separate from bot users
- install flow per server
- secret rotation
- permission scopes
- audit logging
- rate limiting
- docs for external developers
- stricter security review of every bot-facing surface

Main lesson:

- platform work is a different class of product problem than feature work

## Recommended Data Model Direction

Recommended early model:

- keep `messages.user_id -> users.id`
- mark bots with `users.is_bot`
- issue bot tokens separately from the human refresh-token flow

Why this is the best early fit:

- the existing message read path already joins messages back to users
- the frontend mostly cares that a message has a username, avatar, and content
- the current UI can likely render bot messages with little or no redesign

Potential later evolution:

- add a more general actor model only if Concord later needs humans, bots, system messages, and other sender types to behave differently enough that `users` becomes awkward

## Recommended First Implementation Slice

The first practical bot slice should be:

1. tighten message and WebSocket authorization
2. add `users.is_bot`
3. create bot token issuance and verification
4. add `POST /api/bots/messages` or similar protected bot endpoint
5. store and broadcast bot-authored messages through the existing message pipeline
6. render bot-authored messages with a simple visual indicator if desired

This is the smallest slice that proves bot support is real without committing to a full ecosystem design.

## Risks To Watch

- mixing bot auth into the human refresh-token model too early
- adding a separate `bots` table too early and then duplicating user-like fields
- exposing event delivery before permission boundaries are reliable
- building a command system before deciding how events are modeled
- overfitting the design to Discord before Concord's own learning goals are clear

## Success Criteria

Bot support is succeeding if:

- bot accounts can be reasoned about as clearly as user accounts
- permissions stay easier to understand, not harder
- bot-authored messages reuse the normal chat path instead of creating a parallel message system
- the project can stop after an internal-bot phase and still have a coherent product
- later platform work remains optional rather than forced
