# Project Overview

This is a **Backstage plugin for Dynatrace** that enables querying Dynatrace
data using DQL (Dynatrace Query Language) directly within Backstage entity
pages. The project follows a monorepo structure using Yarn workspaces and Lerna
for package management.

# Technology Stack & Constraints

## Framework Requirements

- **Backstage**: v1.x - Open-source developer portal framework
- **Node.js**: 18, 20, or 22 (engines constraint)
- **Package Manager**: Yarn v4 with workspaces
- **Monorepo**: Lerna v8 for publishing

## Development Stack

- **TypeScript**: ~5.x with strict mode
- **React**: v18 (Backstage enforced)
- **Material-UI**: v4.x (legacy for Backstage compatibility)
- **Testing**: Jest with Backstage CLI + React Testing Library
- **Validation**: Zod v3.x for runtime schemas

# Project Structure

```
├── packages/          # Backstage applications
│   ├── app/          # Frontend app with plugin integration
│   └── backend/      # Backend app with plugin registration
└── plugins/          # Plugin packages
    ├── dql/          # Frontend plugin (React components)
    ├── dql-backend/  # Backend plugin (API services)
    └── dql-common/   # Shared schemas and types
```

# Development Standards

## Code Quality

- **Apache 2.0**: License headers enforced via ESLint
- **Conventional Commits**: `feat:`, `fix:`, `chore:` etc.
- **Prettier**: Spotify config with import sorting
- **TypeScript**: Strict configuration from Backstage CLI

## Plugin Architecture

- **Plugin ID**: `dynatrace-dql`
- **Frontend**: Entity cards with lazy loading
- **Backend**: Express routers with new backend system
- **API**: OAuth 2.0 + discovery service integration

# Development Workflows

## Commands

- `yarn dev` - Start both frontend and backend in development
- `yarn test` - Run tests for changed files
- `yarn test:all` - Run all tests with coverage
- `yarn lint:all` - Lint entire codebase
- `yarn build:all` - Build all packages

## Monorepo Management

- Use `yarn workspace <name>` for package-specific commands
- Lerna handles version management and publishing
- Workspaces defined in root `package.json`

## Testing Strategy

- Jest with Backstage CLI configuration
- Custom polyfills in `jest.polyfills.js`
- Mock external APIs properly
- Aim for high coverage on critical paths
