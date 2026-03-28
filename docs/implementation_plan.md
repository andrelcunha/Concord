# Concord Implementation Plan

This document turns the current brainstorming into a practical development plan.

The goal is to make collaboration between the project owner and AI assistance predictable, incremental, and easy to adjust.

## Planning Philosophy

Concord should be planned at three levels:

1. vision
2. sprints
3. implementation slices

The most important working unit is the implementation slice.

## What Is An Implementation Slice

An implementation slice is a small end-to-end unit of work that:

- solves one visible problem
- keeps the app in a working state
- teaches a clear lesson
- is small enough to build and review without ambiguity

Examples:

- scaffold the new React app shell
- implement login in the React frontend
- render the server rail from backend data
- connect the chat view to the WebSocket endpoint

## Recommended Collaboration Model

The best working loop for this project is:

1. choose the next slice
2. confirm the goal and boundaries
3. implement it end-to-end
4. explain the important decisions in backend-friendly terms
5. update docs only when architecture or product direction changes

This keeps progress visible and prevents the frontend from becoming a black box.

## How The Project Owner And AI Should Work Together

Recommended responsibilities:

- the project owner chooses priorities, learning goals, and product direction
- the AI assistant proposes structure, implements slices, and explains tradeoffs
- both use the docs to keep decisions stable over time

Recommended prompt pattern:

- name the sprint
- name the slice
- say the user-facing goal
- say whether this is implementation, planning, or review

Examples:

- “Sprint 1, slice 1: scaffold the React app shell.”
- “Sprint 3, slice 2: implement server selection using route params.”
- “Review this slice like a PR and focus on regressions.”

## Sprint Overview

## Sprint 0: Alignment And Migration Prep

Goal:

- remove ambiguity before React migration begins

Key outcomes:

- product vision is documented
- roadmap is documented
- frontend architecture is documented
- design direction is documented
- implementation plan is documented

Suggested slices:

1. finalize the planning docs
2. define the canonical route model
3. define the initial frontend stack
4. define the first React shell scope

Sprint 0 decisions currently locked:

- DMs are a placeholder in Sprint 1 and become real later
- DMs should reuse the same core chat architecture by default
- `username` is the stable account identifier
- `full_name` and `avatar_url` are later optional profile fields
- `nickname` is a later feature and may be server-specific
- early permissions stay simple
- layout should remain strongly Discord-like
- login and register are separate routes
- authenticated product routes live under `/app`
- server and channel context should be encoded in the URL
- the initial React stack is React, Vite, React Router, Tailwind CSS, Zustand, and Axios
- local component state is the default state choice
- route params are the source of truth for navigation state
- Zustand is reserved for small shared app state
- Redux and TanStack Query are intentionally deferred

Canonical route model:

- `/login`
- `/register`
- `/app`
- `/app/servers/:serverId/channels/:channelId`
- `/app/dm`
- `/app/dm/:conversationId`
- `/app/settings`

## Sprint 1: React App Shell

Goal:

- establish the canonical Discord-like layout in React

Target outcome:

- a protected app shell exists with the right structural panels, even if some areas are placeholders

Locked scope boundary:

- Sprint 1 is layout first
- backend integration happens in later sprints
- the purpose of Sprint 1 is to make the app structurally correct before making it fully functional

Suggested slices:

1. scaffold the React app structure
2. add routing and top-level app layout
3. build the left server rail shell
4. add the DM entry placeholder
5. build the channel sidebar shell
6. add the settings entry placeholder
7. add an empty-state main panel

Things intentionally out of scope for Sprint 1:

- real login and registration integration
- backend data fetching
- real server and channel data
- chat history loading
- WebSocket integration
- optimistic messaging
- unread logic
- real settings editing
- real DM behavior

## Sprint 2: Auth And Session Flow

Goal:

- make login and registration work in the new frontend

Target outcome:

- a user can authenticate and enter the new shell reliably

Suggested slices:

1. implement login screen
2. implement registration screen
3. create shared API client and auth helpers
4. implement protected routes
5. implement logout flow
6. implement session hydration on refresh

## Sprint 3: Server And Channel Navigation

Goal:

- align the frontend navigation model with the backend domain model

Target outcome:

- the app has one coherent server-first navigation flow

Suggested slices:

1. fetch and render the server rail
2. implement active server selection
3. fetch and render channels for the selected server
4. connect route params to selected server and channel
5. build empty states for missing or empty selections

## Sprint 4: Core Chat Loop

Goal:

- restore the smallest useful Discord-like chat flow

Target outcome:

- user can select a channel, read history, and exchange live messages

Suggested slices:

1. load message history
2. render the message list
3. connect the WebSocket lifecycle to the active channel
4. send a message
5. append incoming messages in realtime
6. handle loading, empty, and error states

## Sprint 5: Chat Quality

Goal:

- make the chat experience feel more real and more resilient

Target outcome:

- chat feels closer to a real collaboration product than a basic transport demo

Suggested slices:

1. optimistic sending
2. reconnect behavior
3. unread markers
4. better message grouping and timestamps
5. message pagination or infinite scroll

## Sprint 6: Account And Settings

Goal:

- turn the settings placeholder into a real product surface

Target outcome:

- the user has a place to view and later edit personal profile information

Suggested slices:

1. implement settings route and layout
2. show current account summary
3. define profile fields to support first
4. wire editable settings once backend support exists

Possible initial fields:

- full name
- nickname
- avatar or profile photo

## Sprint 7: Social And Realtime Enhancements

Goal:

- deepen the collaboration model after the core loop is stable

Candidate slices:

- direct messages
- presence
- typing indicators
- reactions
- invites
- role or permission behavior

## Sprint 8: Rich Communication

Goal:

- explore more advanced message and content flows

Candidate slices:

- attachments
- search
- better notifications
- thread-like structures

## Sprint 9: Voice And Video Exploration

Goal:

- explore the harder communication problems after text chat is solid

Candidate slices:

- signaling experiments
- voice room lifecycle
- video room lifecycle
- session coordination

This sprint is intentionally late. It is important for learning, but not at the cost of leaving the core chat product unfinished.

## Recommended Immediate Next Steps

The next best sequence is:

1. finish Sprint 0 by treating these docs as the current source of truth
2. begin Sprint 1 with layout-first React scaffolding
3. build the canonical shell before migrating detailed views
4. restore auth and navigation before chat polish

## How To Choose The Next Slice

When deciding what to do next, prefer slices that:

- unlock other work
- reduce ambiguity
- produce visible progress
- keep the product coherent

If two slices are possible, choose the one that strengthens the foundation first.

## What To Avoid

- giant rewrites without checkpoints
- migrating all existing Vue code blindly
- adding features without a learning reason
- building multiple competing frontend patterns
- over-abstracting before the new shell is stable

## Definition Of Done For A Slice

A slice is done when:

- the user-facing goal is met
- the codebase still has one clear direction
- docs are updated if the architecture changed
- known follow-ups are stated explicitly

## Working Rule

When in doubt, make the next slice smaller.
