---
name: "Testing Conventions"
description: "Use when creating or modifying unit tests, integration tests, route handler tests, API tests, or React component tests with Vitest and Testing Library."
applyTo: "**/*.spec.{ts,tsx}"
---

# Testing Conventions

## Default Stack

- Use Vitest as the test runner.
- Use Testing Library for UI behavior assertions.

## General Rules

- Follow arrange, act, assert structure.
- Prefer behavior-driven assertions over implementation details.
- Keep mocks focused and minimal.
- Avoid brittle timing assumptions.

## Required Coverage Pattern

- Include at least one expected success path.
- Include at least one edge or failure path for critical behavior.

## UI Test Rules

- Prefer accessible queries such as role and label.
- Avoid relying on fragile CSS selectors.

## Integration and Route Handler Rules

- Validate status code and response body.
- Cover invalid input and error handling paths.
- Keep network and environment dependencies isolated.

## Repository Alignment

- Follow existing Next.js App Router guidance in workspace instructions.
- Keep tests colocated near related source files when practical.
