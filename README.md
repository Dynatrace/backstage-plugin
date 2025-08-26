# Dynatrace Backstage Plugins

_Context-rich observability and security insights at hand_ - The Dynatrace
Backstage plugins enable you to fetch observability and security data from
[Dynatrace](https://dynatrace.com/) to be displayed at software components
managed in your
[Backstage Software Catalog](https://backstage.io/docs/features/software-catalog/).
The data is in tabular format with smart links to Dynatrace Apps for deeper
analysis and root cause investigation in case of a related problem or security
vulnerability.

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
namespaces, i.e., `development`, `hardening`, and `production`. The table
provides smart links for more details about the workload and logs in Dynatrace.

![Kubernetes deployments monitored by Dynatrace](/docs/images/backstage_dynatrace_plugin.png 'Kubernetes deployments monitored by Dynatrace')

> While Kubernetes deployments are supported by default, any data can be fetched
> from Dynatrace and displayed in Backstage. See below how to configure
> [custom queries](#custom-queries).

## Getting Started

Next are the instructions to install, integrate, configure, and run the
Dyantrace Backstage plugins.

### Install Plugins

> We are publishing our packages to NPM and removed the release candidate
> (v1.0.0-rc1) packages from the GitHub registry. If you were using the
> v1.0.0-rc1 packages, please update your `.yarnrc.yml` correspondingly.

Install the DQL plugins into Backstage:

```bash
yarn --cwd packages/app add @dynatrace/backstage-plugin-dql
yarn --cwd packages/backend add @dynatrace/backstage-plugin-dql-backend
yarn --cwd packages/backend add @dynatrace/backstage-plugin-dql-common
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

### Integrate the DQL Backend Plugin

Add the DQL backend plugin to in `packages/backend/src/index.ts`:

```ts
const backend = createBackend();
...
backend.add(import('@dynatrace/backstage-plugin-dql-backend'));
...
```

See the `index.ts` file in this repository (`packages/backend/src/index.ts`) for
a full example.

### Add Dynatrace Environment Connection

Before configuring a Dynatrace connection, an OAuth 2.0 client is required.

<details>
  <summary>How to create an OAuth 2.0 client</summary>

1. In Dynatrace, go to
   [Account Management](https://docs.dynatrace.com/docs/manage/account-management).
2. Select **Identity & access management** > **OAuth clients**.
3. Select **Create client**.
4. Enter a client description and the user email.
5. Select at least the following scopes.
   - `storage:buckets:read`
   - `storage:entities:read`
   - `storage:events:read`
   - `storage:metrics:read`
   - `storage:security.events:read`
6. Scroll down and select **Create client**.
7. Copy your client ID, client secret, and Dynatrace account URN. These settings
are required for the Backstage plugin
[configuration](https://github.com/Dynatrace/backstage-plugin?tab=readme-ov-file#add-dynatrace-environment-connection).
</details>

Create or update the `app-config.local.yaml` file (excluded by `.gitignore`)
configuring the connection to the Dynatrace environment:

```yaml
dynatrace:
  environments:
    - name: xxxxxxxx
      url: https://xxxxxxxx.apps.dynatrace.com
      tokenUrl: https://sso.dynatrace.com/sso/oauth2/token
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

_Convention:_ Kubernetes pods will be listed for the corresponding Backstage
component if they are properly annotated in the deployment descriptor. See
[annotations](https://backstage.io/docs/features/software-catalog/descriptor-format/#annotations-optional).

Example:

```yaml
backstage.io/kubernetes-id: <backstage-namespace>.<backstage-component-name> *)
backstage.io/kubernetes-namespace: namespace
backstage.io/kubernetes-label-selector: stage=hardening,name=frontend
```

\*) While any value can be defined, it is recommended to set the backstage
namespace followed by the component name.

- The annotation `backstage.io/kubernetes-id` will look for the Kubernetes label
  `backstage.io/kubernetes-id`.
- The annotation `backstage.io/kubernetes-namespace` will look for the
  Kubernetes namespace.
- The annotation `backstage.io/kubernetes-label-selector` will look for the
  labels defined in it. So
  `backstage.io/kubernetes-label-selector: stage=hardening,name=frontend` will
  look for a Kubernetes label `stage` with the value `hardening` and a label
  `name` with the value `frontend`.

If a `backstage.io/kubernetes-label-selector` is given,
`backstage.io/kubernetes-id` is ignored.

If no namespace is given, it looks for all namespaces. There is no fallback to
`default`.

The query for fetching the monitoring data for Kubernetes deployments is defined
here:
[`dynatrace.kubernetes-deployments`](plugins/dql-backend/src/service/queries.ts).
You can change this query for all cards or override it using a custom query.

### Site Reliability Guardian Validations

Using the `EntityDqlQueryCard` with the queryId `dynatrace.srg-validations`, you
can see the validations of the site reliability guardians in your Dynatrace
environment.

```jsx
<EntityDqlQueryCard
  title="Site Reliability Guardian Validations"
  queryId="dynatrace.srg-validations"
/>
```

To filter for specific guardians, you can filter tags defined in the
`metadata.annotations` property of the `catalog-info.yaml` file under the key
`dynatrace.com/guardian-tags`.

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: demo-backstage
  description: Backstage Demo instance.
  annotations:
    backstage.io/kubernetes-id: kubernetescustom
    dynatrace.com/guardian-tags: 'service=my-service,stage=development,novalue'
```

There are two ways to filter tags:

1. **Key-Value Match:** The tag must match both the key and the value. For
   example, the key `service` must have the value `my-service`.
2. **Key Exists:** The tag key must exist with any value. For example, the key
   `novalue`.

The difference between these filtering methods is indicated by the presence of
the `=` symbol.

For the example provided above, the filtered guardian should have at least these
tags:

```yaml
service: my-service
stage: development
novalue:
```

See
[How to create a Site Reliability Guardian](https://docs.dynatrace.com/docs/shortlink/guardian-create-srg#create-a-guardian-from-a-template)
and [Guardian tags](https://docs.dynatrace.com/docs/shortlink/srg-landing#tags).

The query for fetching the monitoring data for Site Reliability Guardian
validations is defined here:
[`dynatrace.srg-validations`](plugins/dql-backend/src/service/queries.ts). You
can change this query for all cards or override it using a custom query.

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

To be able to render correctly, the DQL must return an array. Links are also
supported and can be added to the table if transformed like this:

`Logs: { type: 'link', title: 'Link to Logs', url: 'https...' }`

An example of a valid DQL result would be:

```json
[
  {
    "Name": "backstage",
    "Namespace": "hardening",
    "LogCount": 0,
    "latestLog": null,
    "hasLogs": false,
    "Link": {
      "type": "link",
      "text": "Click me",
      "url": "https://backstage.io"
    },
    "metadata": {
      "time": {
        "timestamp": "xyz"
      }
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

### Custom Queries within the catalog-info.yaml file of the Backstage Entity

You can register custom queries in the `metadata.dynatrace.queries` property of
a component within the `catalog-info.yaml` file

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: demo-backstage
  description: Backstage Demo instance.
  annotations:
    backstage.io/kubernetes-id: kubernetescustom
    dynatrace.com/guardian-tags: 'service=my-service,stage=development,novalue'
  dynatrace:
    queries:
      - id: Error Logs
        description: Fetch Error Logs
        query: >
          fetch logs, from: -2d
                | filter status == "ERROR"
                | sort timestamp desc
                | fieldsAdd content=if(isNull(content), "N/A", else: content)
                | fieldsAdd source=if(isNull(log.source), "N/A", else:
          log.source)
                | fieldsAdd host=if(isNull(host.name), "N/A", else: host.name)
                | fieldsAdd environment = "${environmentName}"
                | fieldsKeep timestamp, source, content, host, environment
spec:
  type: website
  owner: user:default/mjakl
  lifecycle: experimental
  system: integrations
```

As mentioned before, queries can contain placeholders. In the catalog-info.yaml
file, the placeholders are prefixed with a single `$`. Please find the supported
placeholders listed
[here](https://github.com/Dynatrace/backstage-plugin/blob/eac6adfe0c25fc7a4e5b0b7d05d5dc83464f3652/README.md#custom-queries).

To include the result tables for the custom queries of the entity, you would
use:

```jsx
<EntityCatalogInfoQueryCard />
```

This component displays a result table for each query. The order in which the
tables are displayed depends on the order of the entity's queries defined in the
catalog-info.yaml file.

### Optional environment limitation for custom queries

It is possible to specify the environments in which each query defined in the
`app-config.yaml` and `catalog-info.yaml` is executed.

By default, queries are executed against all defined environments.

Example query defined in `catalog-info.yaml` with environment limitation:

```
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: demo-backstage
  description: Backstage Demo instance.
  annotations:
    backstage.io/kubernetes-id: kubernetescustom
    dynatrace.com/guardian-tags: "service=my-service,stage=development,novalue"
  dynatrace:
    queries:
      - id: Error Logs
        description: Fetch Error Logs
        environments:
          - tenant1
          - tenant2
        query: >
          fetch logs, from: -2d
                | filter status == "ERROR"
                | sort timestamp desc
                | fieldsAdd content=if(isNull(content), "N/A", else: content)
                | fieldsAdd source=if(isNull(log.source), "N/A", else: log.source)
                | fieldsAdd host=if(isNull(host.name), "N/A", else: host.name)
                | fieldsAdd environment = "${environmentName}"
                | fieldsKeep timestamp, source, content, host, environment
```

The environments defined for a query must align with the environments names
configured in the `app-config.local.yaml` file.

### Sample DQL Queries

These are sample custom queries for the `app-config.yaml`. To use these queries
in the `catalog-info.yaml`, you need to remove one `$` from the placeholders.

Query Error Logs:

```
fetch logs, from: -2d
        | filter status == "ERROR"
        | sort timestamp desc
        | fieldsAdd content=if(isNull(content), "N/A", else: content)
        | fieldsAdd source=if(isNull(log.source), "N/A", else: log.source)
        | fieldsAdd host=if(isNull(host.name), "N/A", else: host.name)
        | fieldsAdd environment = "$${environmentName}"
        | fieldsKeep timestamp, source, content, host, environment
```

Query Problem Events:

```
fetch events, from: -2d
        | filter event.kind=="DAVIS_PROBLEM"
        | fieldsAdd category=if(isNull(event.category), "N/A", else: event.category)
        | fieldsAdd id=if(isNull(event.id), "N/A", else: event.id)
        | fieldsAdd status=if(isNull(event.status), "N/A", else: event.status)
        | fieldsAdd name=if(isNull(event.name), "N/A", else: event.name)
        | fieldsAdd environment = "$${environmentName}"
        | fieldsKeep timestamp, category, id, name, status, environment
```

Query Security Vulnerabilities:

```
fetch security.events, from: -2d
        | filter event.provider=="Dynatrace"
        | filter event.kind=="SECURITY_EVENT"
        | filter event.type=="VULNERABILITY_STATUS_CHANGE_EVENT"
        | filter event.level=="VULNERABILITY"
        | fieldsAdd environment = "$${environmentName}"
        | fieldsKeep timestamp, event.status, vulnerability.display_id, event.id, vulnerability.title, vulnerability.risk.level, vulnerability.display_id, environment
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
