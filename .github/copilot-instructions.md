# Project Overview

This is a **Backstage plugin for Dynatrace** that enables querying Dynatrace data using DQL (Dynatrace Query Language) directly within Backstage entity pages. The project follows a monorepo structure using Yarn workspaces and Lerna for package management.

# Technology Stack

## Core Framework
- **Backstage**: v1.x - Open-source developer portal framework
- **Node.js**: 22 or higher (supported versions)
- **Package Manager**: Yarn v4
- **Monorepo Management**: Lerna v8 with Yarn workspaces

## Frontend Technologies
- **TypeScript**: ~5.x
- **React**: v17 (types enforced via resolutions)
- **Material-UI**: v4.x (using legacy version for Backstage compatibility)
- **Zod**: v3.x for schema validation
- **React Hooks**: react-use v17.x

## Testing & Quality Tools
- **Jest**: Configured with Backstage CLI and custom polyfills
- **ESLint**: Custom configuration with header enforcement
- **Prettier**: Using Spotify's configuration with Markdown line wrapping
- **TypeScript ESLint**: v7.x
- **Header Plugin**: Enforces Apache 2.0 license headers

# Project Structure

## Workspace Organization
```
backstage-plugin/
├── packages/
│   ├── app/           # Frontend Backstage application
│   └── backend/       # Backend Backstage application
├── plugins/
│   ├── dql/           # Frontend DQL plugin
│   ├── dql-backend/   # Backend DQL plugin
│   └── dql-common/    # Shared types and schemas
└── docs/              # Documentation and assets
```

## Plugin Architecture
- **Frontend Plugin** (`@dynatrace/backstage-plugin-dql`): React components for DQL queries
- **Backend Plugin** (`@dynatrace/backstage-plugin-dql-backend`): API services for Dynatrace integration
- **Common Package** (`@dynatrace/backstage-plugin-dql-common`): Shared schemas and types

# Code Standards & Conventions

## Licensing
- **License**: Apache License 2.0
- **Header Enforcement**: All TypeScript/JavaScript files must include the Apache 2.0 license header
- **Header Configuration**: Defined in `header.js` and enforced via ESLint

## TypeScript Configuration
- **Base Config**: Extends `@backstage/cli/config/tsconfig.json`
- **Strict Mode**: Enabled with incremental compilation
- **Include Paths**: `packages/*/src`, `plugins/*/src`, `plugins/*/dev`, `plugins/*/migrations`
- **Output Directory**: `dist-types`

## Code Formatting
- **Prettier**: Uses Spotify's configuration with import sorting
- **Auto-fixing**: Configured in lint-staged for pre-commit hooks

## Commit messages
- **Conventional Commits**: Enforced via commitlint
- **Prefix**: Use `feat:`, `fix:`, `chore:`, etc. Do not allow `CA-xxxxx` (with `xxxxx` being a number) prefixes

# Backstage Plugin Development

## Plugin Registration
- **Plugin ID**: `dynatrace-dql`
- **API Reference**: `dqlQueryApiRef`
- **Components**: 
  - `EntityDqlQueryCard` - Generic DQL query interface
  - `EntityCatalogInfoQueryCard` - Catalog-specific queries
  - `EntityKubernetesDeploymentsCard` - Kubernetes deployment queries

## Backend Plugin Pattern
- **New Backend System**: Uses `createBackendPlugin`
- **Router Creation**: Express router with typed options
- **API Client**: `DqlQueryApiClient` for Dynatrace API integration
- **Discovery API**: Used for service discovery

## Configuration Schema
- **Backend Config**: Defined in `config.d.ts`
- **Dynatrace Queries**: Configured in `app-config.yaml` under `dynatrace.queries`
- **Entity Annotations**: Support for `dynatrace.com/guardian-tags` and custom queries

# API Integration Patterns

## Dynatrace API
- **Authentication**: OAuth 2.0 token-based
- **Query Execution**: Asynchronous DQL query processing
- **Polling**: Wait for query completion with timeout handling
- **Error Handling**: Proper HTTP status code handling and logging

## Backstage Integration
- **Entity Provider**: Reads entity metadata for query context
- **Catalog Integration**: Fetches queries from entity `dynatrace.queries` annotation
- **Variable Substitution**: Supports `${environmentName}` and other dynamic variables

# Best Practices

## Code Organization
- **Barrel Exports**: Use `index.ts` files for clean public APIs
- **Component Co-location**: Keep components, tests, and types together
- **API Separation**: Clear separation between frontend and backend logic

## Error Handling
- **Zod Validation**: Use for runtime type checking
- **Proper Logging**: Winston logging in backend services
- **User-Friendly Errors**: Proper error states in React components

## Performance
- **Lazy Loading**: Components loaded on demand
- **Proper Memoization**: Use React hooks appropriately
- **API Caching**: Implement caching strategies for Dynatrace API calls

## Testing
- **Test Files**: Use `.test.ts` or `.test.tsx` extensions
- **Setup**: Custom Jest polyfills for Node.js globals and fetch API
- **Unit Tests**: Comprehensive test coverage for utilities and API clients
- **Component Tests**: React Testing Library for component testing
- **Mock External APIs**: Proper mocking of Dynatrace API calls
- **Test Data**: Use realistic test data in development mode
- **Coverage**: Aim for high coverage, especially for critical logic
