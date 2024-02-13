# Dynatrace Backstage Plugins

_Observability and security insights at hand_ - The Dynatrace Backstage plugins
enables you to fetch observability and security data from
[Dynatrace](https://dynatrace.com/) to be displayed at software components
managed in your
[Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/).
The data is represented in tabular format with smart links to Dynatrace app for
deeper analysis and root cause investigation in case of a related problem or
security vulnerability.

The plugins support Kubernetes entities by default. This means that it comes
with a pre-configured query for Kubernetes deployments and a dedicated component
for data representation.

This repository contains a complete Backstage installation at its root, with the
individual plugins in the `plugins` directory. Backstage is configured to
include the plugins so you can start the app and see them in action.

**Table of contents:**

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Additional Features](#additional-features)
- [Contributing](#contributing)

## Overview

Three plugins are required to fetch and visualize the data from Dynatrace:

- [DQL](./plugins/dql/README.md) - A plugin showing DQL query results from
  Dynatrace in Backstage.
- [DQL Backend](./plugins/dql-backend/README.md) - The backend for the DQL
  plugin.
- [DQL Common](./plugins/dql-common/README.md) - Common functionality shared
  between the DQL frontend and backend plugin.

With the Backstage plugins, the Backstage Software Catalog component can be
associated with real-time monitoring data. The screenshot shows three Kubernetes
deployments of the `easytrade-frontend` component running in different
namespaces, i.e., `development`, `hardening`, and `production`. he table
provides smart links for more details about the workload and logs in Dynatrace.

![Kubernetes deployments monitored by Dynatrace](/docs/images/backstage_dynatrace_plugin.png 'Kubernetes deployments monitored by Dynatrace')

> While Kubernetes deployments are supported by default, any data can be fetched
> from Dynatrace and displayed in Backstage. See below how to configure
> [custom queries](#custom-queries).

## Getting Started

Next are the instructions to install, integrate, configure, and run the
Dyantrace Backstage plugins.

### Install Plugins

Install the DQL plugins into Backstage:

```bash
cd packages/app
yarn add @dynatrace/backstage-plugin-dql
```

```bash
cd packages/backend
yarn add @dynatrace/backstage-plugin-dql-backend
```

```bash
cd packages/backend
yarn add @dynatrace/backstage-plugin-dql-common
```

### Integrate the `EntityDqlQueryCard`

Add the DQL plugin to the respective component type pages in your
`packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
<EntityDqlQueryCard
  title="Kubernetes Deployments"
  queryId="dynatrace.kubernetes-deployments"
/>
```

See the `EntityPage.tsx` file in this repository
(`packages/app/src/components/catalog/EntityPage.tsx`) for a full example.

### Integrate the DQL Plugin

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

### Add Dynatrace Environment Connection

Create or update the `app-config.local.yaml` file (excluded by `.gitignore`)
configuring the connection to the Dynatrace environment:

```yaml
dynatrace:
  environments:
    - name: xxxxxxxx
      url: https://xxxxxxxx.sprint.apps.dynatracelabs.com
      tokenUrl: https://sso-sprint.dynatracelabs.com/sso/oauth2/token
      accountUrn: <accountUrn>
      clientId: <clientId>
      clientSecret: <clientSecret>
```

> See below how to configure
> [multiple Dynatrace environments](#multi-environment-support).

### Run Backstage with Dynatrace Plugins

To start the app, run:

```sh
yarn install
yarn dev
```

Backstage is pre-configured but relies on appropriate data to be available in
the demo Dynatrace environment. See [catalog-info.yaml](./catalog-info.yaml) for
details.

## Additional Features

Find here additional features to customize the plugin for different
requirements.

### Multi-environment Support

If the component in Backstage should display data from multiple Dynatrace
environments, add each Dynatrace environment to the `dynatrace.environments`
list in the `app-config.local.yaml` file.

```yaml
dynatrace:
  environments:
    - name: xxxxxxxx
      url: https://xxxxxxxx.apps.dynatrace.com
      tokenUrl: https://sso.dynatrace.com/sso/oauth2/token
      accountUrn: <accountUrn>
      clientId: <clientId>
      clientSecret: <clientSecret>
    - name: yyyyyyyy
      url: https://yyyyyyyy.apps.dynatrace.com
      tokenUrl: https://sso.dynatrace.com/sso/oauth2/token
      accountUrn: <accountUrn>
      clientId: <clientId>
      clientSecret: <clientSecret>
```

### Kubernetes Use Case

Using the `EntityKubernetesDeploymentsCard`, you can see the Kubernetes
deployments in your Dynatrace environment.

```jsx
<EntityKubernetesDeploymentsCard
  title="Show me my Kubernetes deployments"
  queryId="dynatrace.kubernetes-deployments"
/>
```

_Convention:_ Kubernetes pods with a `backstage.io/component` label will be
listed for the corresponding Backstage component if they are properly annotated
in the deployment descriptor:

```yaml
backstage.io/component: <backstage-namespace>.<backstage-component-name>
```

The query for fetching the monitoring data for Kubernetes deployments is defined
here:
[`dynatrace.kubernetes-deployments`](plugins/dql-backend/src/service/queries.ts).
You can change this query for all cards or override it using a custom query.

### Custom Queries

You can also register your custom queries and use them with
`EntityDqlQueryCard`:

```yaml
dynatrace:
  queries:
    - id: my-custom-query
      query: >
        fetch events | filter event.kind == "DAVIS_EVENT" | fields event.kind,
        timestamp
```

Queries can contain placeholders, which will be replaced with the values from
the context in which it is executed. These placeholders are prefixed with `$$`
in order to escape the
[environment variable substitution](https://backstage.io/docs/conf/writing/#environment-variable-substitution)
of Backstage. The following placeholders are available:

- `$${componentNamespace}` the namespace of the Backstage component, as defined
  in the Backstage catalog
- `$${componentName}` the name of the Backstage component, as defined in the
  Backstage catalog
- `$${environmentName}` the name of the environment (e.g. `production`), as
  defined in the Dynatrace environment configuration
- `$${environmentUrl}` the URL of the environment (e.g.
  `https://my-environment.dynatrace.com`), as defined in the Dynatrace
  environment configuration

For example, to filter for the events of the component, you could use the
following in your query:

```dql
filter backstageComponent == "$${componentNamespace}.$${componentName}"
```

To be able to render correctly, the DQL must return data conforming to the
following:

- No `null` values; use `coalesce` to replace `null` values with a default value
- May contain simple types:
  - Strings (e.g. `Name: 'My Name'`)
- May contain complex types that have a type discriminator (`type`):
  - Links: (e.g.
    `Logs: { type: 'link', title: 'Link to Logs', url: 'https...' }`)
- As a fallback, other types will be rendered as JSON

An example of a valid DQL result would be:

```json
[
  {
    "Name": "backstage",
    "Namespace": "hardening",
    "Link": {
      "type": "link",
      "text": "Click me",
      "url": "https://backstage.io"
    }
  }
]
```

To include the result table for your custom query, you would reference the query
by its ID with the `custom.` prefix:

```jsx
<EntityDqlQueryCard
  title="My Custom Query Results"
  queryId="custom.my-custom-query"
/>
```

### Backlink to Dynatrace

To link from a table cell to a Dynatrace app, the DQL query must contain a
record with the proper `type`, `text`, and `url`. This is an example to link to
the Dynatrace Kubernetes app filtered by Kubernetes pods:

```
fetch dt.entity.cloud_application, from: -10m
| fieldsAdd Workload = record({type="link", text=entity.name, url=concat("\${environmentUrl}/ui/apps/dynatrace.kubernetes/resources/pod?entityId=", id)})
```

The query returns a result of:

```json
[
  {
    "Workload": {
      "type": "link",
      "text": "<ENTITY_NAME>",
      "url": "https://<ENVIRONMENT_URL>/ui/apps/dynatrace.kubernetes/resources/pod?entityId=<ENTITY_ID>"
    }
  }
]
```

## Help & Support

This Backstage integration is an open source project. The features are fully
supported by [Dynatrace](https://www.dynatrace.com).

**Get help:**

- Ask a question in the
  [product forums](https://community.dynatrace.com/t5/Using-Dynatrace/ct-p/UsingDynatrace)

**Open a GitHub issue to:**

- Report minor defects, minor items, or typos
- Ask for improvements or changes
- Ask any questions related to the community effort
- Contribute as per our [Contribution guidelines](#contributing)

SLAs don't apply for GitHub tickets.

**Customers can open a ticket on the
[Dynatrace support portal](https://support.dynatrace.com/supportportal/) to:**

- Get support from the Dynatrace technical support engineering team
- Manage and resolve product related technical issues

SLAs apply according to the customer's support level.

## Contributing

Everyone is welcome to contribute to this repository. See our
[contributing guidelines](./CONTRIBUTING.md), raise
[issues](https://github.com/Dynatrace/backstage-plugin/issues) or submit
[pull requests](https://github.com/Dynatrace/backstage-plugin/pulls).
