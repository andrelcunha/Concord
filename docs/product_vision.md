# Concord Product Vision

## Purpose

Concord is a stripped-down Discord-inspired chat product built as a learning project.

The goal is not to compete with Discord or recreate every feature. The goal is to build the core collaboration experience and use that process to learn the kinds of product and engineering problems Discord had to solve.

## Product Thesis

Concord should feel familiar to people who already know Discord:

- a left rail for servers
- a direct-messages entry point in that same rail
- a second panel for channels
- a main chat area for the selected conversation

The product should preserve that recognizable mental model while staying smaller and more teachable.

## What Concord Is

- a realtime chat application
- a Discord-like interface with the core collaboration loop
- a sandbox for learning backend, frontend, and product tradeoffs
- a place to explore features because they teach something meaningful

## What Concord Is Not

- a full Discord clone
- a production-ready social platform
- a feature race with mature chat products
- a project that optimizes polish over learning value

## Core Experience

The first version of Concord should support the smallest useful Discord-like workflow:

1. create an account and sign in
2. choose a server or direct-message entry point
3. choose a channel
4. read message history
5. send and receive realtime messages

That loop is the foundation. Everything else should build on top of it.

The shell should also reserve a clear place for user settings, even if the settings surface begins as a placeholder.

## Product Principles

- Favor features that reveal interesting technical or product constraints
- Keep the UI familiar enough that Discord users feel oriented immediately
- Prefer a small, coherent product over a wide but fragmented one
- Use the project to understand systems behavior, not just surface-level UI
- Build the frontend so a backend-oriented developer can still reason about it

## Feature Selection Rule

A feature is a good candidate when it satisfies at least one of these:

- it is part of the core stripped-down Discord experience
- it teaches an important realtime or product-design lesson
- it creates a natural next step from the current architecture

## Near-Term Product Scope

These are the features that best define the initial product:

- authentication
- server navigation
- direct-message entry point in the left rail
- channel navigation
- message history
- realtime messaging
- user settings entry point and placeholder screen
- optimistic sending
- unread indicators
- pagination or infinite scroll for message history

## Mid-Term Learning Features

These are strong candidates once the core loop is stable:

- editable profile and identity settings such as full name, nickname, avatar, and similar account-facing preferences
- presence
- typing indicators
- reactions
- message editing and deleting
- role or permission boundaries
- invite flows
- search

## Long-Term Exploration Features

These are explicitly interesting, but should come later:

- voice calls
- video calls
- screen sharing
- richer media support
- more advanced notifications

Voice and video are especially valuable for learning, but they should come after the text-chat foundation is solid.

## UX Direction

Concord should stay visually close enough to Discord that the structure feels familiar, but it should not become a pixel clone.

The aim is:

- recognizable layout
- familiar interaction patterns
- lighter custom identity layered on top
- simple, teachable UI choices

## Success For This Project

Concord is succeeding if:

- the product feels like a believable stripped-down Discord
- each major feature teaches a concrete lesson
- the codebase stays understandable
- the frontend becomes something the project owner can reason about, even without deep frontend experience
