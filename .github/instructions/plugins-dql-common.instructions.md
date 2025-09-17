---
applyTo: "plugins/dql-common/**/*.ts"
---

# Shared Package - `plugins/dql-common`

## Scope
Shared types, Zod schemas, and validation utilities for frontend and backend plugins. Ensures type safety and consistency across the plugin ecosystem.

## Key Patterns

### Schema Definition
```typescript
// Define Zod schema first, derive TypeScript types
export const TabularDataSchema = z.array(z.record(z.string(), z.unknown()));
export type TabularData = z.infer<typeof TabularDataSchema>;

// Validation utility
export const validateTabularData = (data: unknown): TabularData => {
  return TabularDataSchema.parse(data);
};
```

### Query Configuration Schema
```typescript
export const DynatraceQuerySchema = z.object({
  id: z.string(),
  query: z.string(),
  environments: z.array(z.string()).optional(),
  title: z.string().optional(),
});
export type DynatraceQuery = z.infer<typeof DynatraceQuerySchema>;
```

### Entity Extensions
```typescript
export interface ExtendedEntity extends Entity {
  metadata: Entity['metadata'] & {
    annotations?: {
      'dynatrace.com/guardian-tags'?: string;
      'dynatrace.queries'?: string;
    };
  };
}
```

## Capabilities
- ✅ Zod schemas for runtime validation
- ✅ TypeScript types from schemas
- ✅ Data transformation utilities  
- ✅ Validation functions
- ✅ Constants and shared interfaces

## Restrictions
- ❌ Business logic implementation
- ❌ API calls or authentication
- ❌ React components or Node.js APIs
- ❌ Heavy dependencies or side effects

## Required Dependencies
- `zod` ^3.22.4 - Runtime schema validation (primary dependency)
- TypeScript ~5.x - Type definitions

## Forbidden Dependencies
- React (frontend-specific)
- Express (backend-specific)  
- Large libraries that increase bundle size

## File Structure
```
src/
├── schema/
│   ├── tabularData.ts      # Data table schemas
│   ├── dynatraceQueries.ts # Query config schemas
│   └── index.ts            # Schema exports
└── index.ts                # Public exports
```

## Schema Development Rules
- Define Zod schemas first, derive TypeScript types with `z.infer<>`
- Use barrel exports in `index.ts` for clean imports
- Implement validation utilities alongside schemas
- Keep schemas lightweight and composable

## Testing Requirements
- Test schemas with valid and invalid data
- Verify error messages are meaningful
- Test schema composition and inheritance