# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Gunshi is a modern JavaScript command-line library for creating CLI applications. It supports multiple JavaScript runtimes (Node.js, Deno, Bun) and provides features like declarative command configuration, type safety, composable sub-commands, lazy loading, and internationalization.

## Essential Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests with type checking
pnpm test

# Run linter (ESLint, Prettier, Knip, JSR checks)
pnpm lint

# Auto-fix linting issues
pnpm fix

# Run type checking only
pnpm typecheck

# Run specific tests
pnpm test <pattern>

# Run benchmarks
pnpm bench

# Release new version
pnpm release
```

## Architecture Overview

This is a monorepo managed with pnpm workspaces. The main library code is in `packages/gunshi/`:

- **packages/gunshi/src/**: Core library source code (TypeScript)

  - `index.ts`: Main entry point exporting all public APIs
  - `runner.ts`: Command execution logic
  - `parser.ts`: Command-line argument parsing
  - `resolver.ts`: Command resolution and routing
  - `validator.ts`: Argument validation
  - `renderer.ts`: Help/usage text rendering
  - `types.ts`: TypeScript type definitions
  - `utils/`: Utility functions for various runtime environments

- **packages/gunshi/test/**: Test files corresponding to source modules

- **playground/**: Example projects demonstrating different use cases (simple, type-safe, i18n, lazy-async, etc.)

Key design patterns:

- Commands are defined as objects with `meta` (metadata) and `runner` (execution function)
- Supports both synchronous and asynchronous command execution
- Uses lazy loading for better performance in large CLIs
- Provides composable sub-commands through nested command structures
- Runtime-agnostic design with specific utilities for Node.js, Deno, and Bun

## Development Guidelines

1. All source code is in TypeScript with strict mode enabled
2. Use ES modules throughout the codebase
3. Follow existing code style (enforced by ESLint and Prettier)
4. Add tests for new features in the corresponding test file
5. Ensure all tests pass and linting is clean before submitting PRs
6. The project uses snapshot testing for renderer output - update snapshots when renderer behavior changes

## Testing Approach

- Unit tests use Vitest with the following patterns:
  - Test files are in `packages/gunshi/test/` with `.test.ts` extension
  - Use `describe` and `it` blocks for test organization
  - Mock external dependencies when needed
  - Snapshot tests for renderer output validation

## Important Notes

- The project supports multiple JavaScript runtimes - ensure changes work across Node.js, Deno, and Bun
- When modifying the parser or resolver, check impact on all playground examples
- The library aims for minimal dependencies and small bundle size
- Type safety is a core feature - maintain strict TypeScript types throughout
- Plugin system is currently under development
