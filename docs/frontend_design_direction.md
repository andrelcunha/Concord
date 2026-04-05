# Concord Frontend Design Direction

This document captures the intended visual and UX direction for the React frontend.

## Design Goal

Concord should feel immediately familiar to Discord users, while still becoming its own project over time.

The experience should be:

- recognizable
- clean
- modern
- calm enough for long chat sessions
- simple enough to build iteratively

## What We Want To Preserve From Discord

- left server rail
- clear channel sidebar
- chat-first main area
- dense but readable layout
- dark, focused collaboration atmosphere
- familiar affordances for navigation and conversation

## What We Do Not Need To Copy Exactly

- exact spacing or dimensions
- branding details
- every icon treatment
- every animation pattern
- advanced product surfaces before they are useful

The goal is “inspired by Discord,” not “pixel-perfect clone.”

## Initial Layout Direction

Primary shell:

- narrow server rail on the far left
- wider channel sidebar next
- large central chat panel

The server rail should include:

- server shortcuts
- a direct-message entry button
- space for add or join actions later
- a user-settings entry point in a consistent bottom area

The channel sidebar should include:

- current server context
- channel list
- room for create-channel affordances later

The chat area should include:

- channel title
- message list
- composer

## Visual Tone

Recommended tone:

- dark theme by default
- restrained color palette
- one strong accent color
- soft surfaces instead of flat black
- readable typography first

The UI should feel intentional, not generic.

## UX Priorities

- users should always know which server they are in
- users should always know which channel they are in
- users should always know where to reach account or profile settings
- message reading should be effortless
- sending a message should feel immediate
- the layout should not surprise users familiar with Discord

## Design Constraints

- do not build multiple competing navigation models
- do not over-style placeholder views
- do not chase visual originality before the shell is coherent
- do not let styling choices obscure product structure

## Immediate UI Targets For Migration

- build the app shell first
- make server and channel selection obvious
- restore a usable chat view
- use placeholders for not-yet-implemented surfaces such as DMs and settings

## Future Visual Opportunities

Once the shell is stable, Concord can develop more personality through:

- slightly more distinctive accent colors
- custom illustrations or empty states
- richer message metadata treatments
- subtle motion for navigation and state changes

## Success Criteria

The design direction is working if:

- a Discord user can navigate it intuitively
- the product feels coherent even with a limited feature set
- the layout teaches the domain model clearly
- the interface is pleasant without becoming design-heavy too early
