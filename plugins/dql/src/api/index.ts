import { DqlQueryApi } from './types';
import { createApiRef } from '@backstage/core-plugin-api';

export { DqlQueryApiClient } from './DqlQueryApiClient';
export type { DqlQueryApi } from './types';

export const dqlQueryApiRef = createApiRef<DqlQueryApi>({
  id: 'plugin.dynatrace-dql.service',
});
