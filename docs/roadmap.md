# Concord Roadmap

This roadmap is organized around learning milestones, not just shipping milestones.

## Phase 0: Foundations

Goal:

- stabilize project setup
- reduce ambiguity in architecture
- prepare for the React migration

Focus:

- frontend migration planning
- config cleanup
- documentation
- clear navigation model

## Phase 1: Core Discord-Like Loop

Goal:

- deliver the smallest real product experience

Features:

- login and registration
- server rail
- direct-messages button placeholder in the left rail
- user settings entry point placeholder
- channel sidebar for selected server
- chat view
- message history
- realtime message delivery

Learning value:

- request flow
- auth state
- realtime synchronization
- state ownership in the frontend

## Phase 2: Chat Quality

Goal:

- make chat feel more realistic and usable

Features:

- editable user profile settings
- optimistic message sending
- loading and error states
- unread indicators
- message pagination
- better reconnect behavior

Learning value:

- latency masking
- eventual consistency edges
- cache invalidation and pagination behavior
- failure recovery in realtime UX

## Phase 3: Social Structure

Goal:

- make servers feel more like collaborative spaces

Features:

- create and join server flows
- direct-message entry flow
- better membership handling
- roles or permissions foundation

Learning value:

- access control
- domain modeling
- multi-tenant style thinking

## Phase 4: Collaboration Signals

Goal:

- add lightweight signals that make the product feel alive

Features:

- presence
- typing indicators
- reactions
- message editing and deleting

Learning value:

- ephemeral state
- high-churn realtime events
- consistency and ordering tradeoffs

## Phase 5: Rich Communication

Goal:

- explore higher-complexity communication features

Features:

- attachments
- search
- better notifications
- thread-like structures if desired

Learning value:

- storage patterns
- indexing and retrieval
- more complex product surfaces

## Phase 6: Voice And Video Exploration

Goal:

- start exploring the next class of hard problems

Features:

- voice call experiments
- video call experiments
- basic session or room coordination

Learning value:

- signaling
- media transport concepts
- session lifecycle
- concurrency and state complexity

This phase is intentionally late. It is important, but it should not compete with finishing the text-chat fundamentals first.

## Current Recommended Priority

If we start the React migration now, the best immediate targets are:

1. define the frontend architecture and layout model
2. migrate the shell layout to React
3. implement server rail plus channel sidebar
4. restore auth flow
5. restore chat history and live messaging

## Things To Avoid Early

- overbuilding design systems
- adding advanced feature flags too soon
- solving voice/video before text chat is mature
- building broad feature lists without a clear learning reason
