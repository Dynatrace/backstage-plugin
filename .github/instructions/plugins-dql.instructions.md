---
applyTo: 'plugins/dql/**/*.ts,plugins/dql/**/*.tsx'
---

# Frontend Plugin - `plugins/dql`

## Scope

Frontend Backstage plugin for Dynatrace DQL integration. Provides React
components and API clients for displaying Dynatrace data in entity pages.

## Key Patterns

### Component Registration

```typescript
export const EntityDqlQueryCard = dqlQueryPlugin.provide(
  createComponentExtension({
    name: 'EntityDqlQueryCard',
    component: {
      lazy: () => import('./components').then(m => m.DqlQuery),
    },
  }),
);
```

### API Client Implementation

```typescript
// Implement DqlQueryApi interface
class DqlQueryApiClient implements DqlQueryApi {
  constructor(private readonly options: { discoveryApi: DiscoveryApi }) {}

  async getData(
    queryNamespace: string,
    queryName: string,
    entityRef: string,
    identityToken: string,
  ): Promise<TabularData> {
    // Backend communication logic
  }
}
```

### Entity Integration

```typescript
// Access entity data in components
const { entity } = useEntity();
const entityRef = stringifyEntityRef(entity);
```

## Capabilities

- ✅ Create entity card components with Material-UI v4
- ✅ Implement API clients for backend communication
- ✅ Use React hooks and catalog integration
- ✅ Write Jest tests with React Testing Library
- ✅ Access entity metadata and annotations

## Restrictions

- ❌ Direct Dynatrace API calls (use backend)
- ❌ OAuth token management
- ❌ File system access
- ❌ Backstage core modifications

## Required Dependencies

- `@backstage/core-plugin-api` - Plugin system
- `@backstage/plugin-catalog-react` - Entity integration
- `@material-ui/core` v4.x - UI components
- `@dynatrace/backstage-plugin-dql-common` - Shared types
- React v18 (Backstage constraint)

## File Structure

```
src/
├── api/           # API clients implementing DqlQueryApi
├── components/    # React components (cards, tables, modals)
├── hooks/         # Custom hooks for data fetching
├── plugin.ts      # Plugin registration and extensions
└── routes.ts      # Route definitions
```

## Testing Requirements

- Mock APIs using `TestApiProvider`
- Test with realistic entity context using `EntityProvider`
- Use `setupTests.ts` for global test configuration
