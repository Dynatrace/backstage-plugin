# (obsolete) Quick-start guide to install the Dynatrace DQL Plugin

1. If you haven't already,
   [install Backstage](https://backstage.io/docs/getting-started/create-an-app).
2. Setup npm to use the GitHub Package Registry as described
   [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package).
   (in short, run
   `npm login --registry https://npm.pkg.github.com --scope @dynatrace` with
   your GitHub personal access token)
3. Install the DQL plugins into Backstage:

```bash
cd packages/app
yarn add @dynatrace/backstage-plugin-dql
```

```bash
cd packages/backend
yarn add @dynatrace/backstage-plugin-dql-backend
```

4. Add the DQL plugin to the respective component type pages in your
   `packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
<EntityDqlQueryCard
  title="Kubernetes Deployments"
  queryId="dynatrace.kubernetes-deployments"
/>
```

See the `EntityPage.tsx` file in this repository
(`packages/app/src/components/catalog/EntityPage.tsx`) for a full example.

5. Add the DQL plugin to the Backstage backend

Add a `dynatrace-dql.ts` file to your `packages/backend/src/plugins` folder. For
example:

```ts
import { PluginEnvironment } from '../types';
import { createRouter } from '@dynatrace/backstage-plugin-dql-backend';
import { Router } from 'express';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  return await createRouter({
    logger: env.logger,
    config: env.config,
  });
}
```

Add the DQL backend plugin to your `main()` in
`packages/backend/src/plugins/catalog.ts`:

```ts
import dql from './plugins/dynatrace-dql';

const dynatraceDqlEnv = useHotMemoize(module, () => createEnv('dynatrace-dql'));

apiRouter.use('/dynatrace-dql', await dql(dynatraceDqlEnv));
```

See the `index.ts` file in this repository (`packages/backend/src/index.ts`) for
a full example.

6. Configure your Dynatrace environment in your `app-config.yaml`:

```yaml
dynatrace:
  environments:
    - name: ...
      url: https://...
      tokenUrl: https://....
      accountUrn: urn:dtaccount:...
      clientId: ...
      clientSecret: ...
```

7. (Optional) Configure a custom DQL query in your `app-config.yaml` (this query
   can be referenced as `custom.<id>` from an `EntityDqlQueryCard`):

```yaml
dynatrace:
  queries:
    - id: ...
      description: ...
      query: >
        ...
```

8. (When using the `dynatrace.kubernetes-workload` query) Annotate your
   Kubernetes workloads:

```yaml
metadata:
  labels:
    backstage.io/component: '<backstage-namespace>.<backstage-name>'
```

9. Configure your Backstage to include the components. For example:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: nginx
  description: Web Server
spec:
  type: website
  owner: user:default/admin
  lifecycle: experimental
  system: integrations
```

10. Deploy the workloads in a Kubernetes cluster that is monitored by Dynatrace.
