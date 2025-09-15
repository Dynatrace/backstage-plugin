---
applyTo: "plugins/dql-backend/**/*.ts"
---

# Backend Plugin - `plugins/dql-backend`

## Scope
Backend Backstage plugin providing Dynatrace API integration, OAuth authentication, query execution, and configuration management.

## Key Patterns

### Plugin Registration
```typescript
export const dqlPlugin = createBackendPlugin({
  pluginId: 'dynatrace-dql',
  register(env) {
    env.registerInit({
      deps: { logger, config, discovery, http, auth },
      async init({ http, config, logger, discovery, auth }) {
        http.use(await createRouter({ config, logger, discovery, auth }));
      },
    });
  },
});
```

### API Endpoints
```typescript
// Standard endpoint pattern
router.get('/custom/:queryId', async (req, res) => {
  const entity = await getEntityFromRequest(req, catalogClient, auth);
  const result = await queryExecutor.executeCustomQuery(req.params.queryId, {
    componentNamespace: entity.metadata.namespace ?? 'default',
    componentName: entity.metadata.name,
  });
  return res.json(result);
});
```

### Configuration Schema
```typescript
// config.d.ts
export type Config = {
  dynatrace: {
    environments: Array<{
      url: string;
      name: string;
      clientId: string;      // @visibility secret
      clientSecret: string;  // @visibility secret
      accountUrn: string;    // @visibility secret
    }>;
    queries?: { [queryId: string]: string };
  };
};
```

## Capabilities
- ✅ Express routers with proper middleware
- ✅ Dynatrace OAuth 2.0 authentication
- ✅ DQL query execution and polling
- ✅ Configuration parsing and validation
- ✅ Entity catalog integration
- ✅ HTTP proxy support

## Restrictions
- ❌ React components or frontend logic
- ❌ Direct database modifications
- ❌ System-level configuration changes
- ❌ Other plugins' behavior modification

## Required Dependencies
- `@backstage/backend-plugin-api` - Modern backend system
- `@backstage/config` - Configuration management
- `@backstage/catalog-client` - Entity access
- `express` + `express-promise-router` - HTTP framework
- `zod` - Runtime validation
- `node-fetch` - HTTP client

## File Structure
```
src/
├── service/
│   ├── dynatraceApi.ts    # OAuth + API client
│   ├── queryExecutor.ts   # Query processing
│   ├── router.ts          # Express endpoints
│   └── queries.ts         # Query management
├── utils/
│   ├── configParser.ts    # Config validation
│   ├── dtFetch.ts         # HTTP utilities
│   └── routeUtils.ts      # Request helpers
└── plugin.ts              # Plugin registration
```

## API Endpoints
- `GET /api/dql/catalog` - Execute entity catalog queries
- `GET /api/dql/custom/:queryId` - Execute custom query
- `GET /api/dql/dynatrace/:queryId` - Execute Dynatrace query

## Testing Requirements
- Mock external APIs with Jest
- Test error scenarios and timeouts
- Validate configuration parsing
- Test entity authorization