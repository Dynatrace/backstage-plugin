# Dynatrace Backstage Plugins

This repository contains a collection of Backstage plugins for Dynatrace.

- [Dynatrace Backstage Plugins](#dynatrace-backstage-plugins)
  - [Plugins](#plugins)
  - [Getting Started](#getting-started)
  - [Development](#development)
    - [(Conventional) Commit Messages](#conventional-commit-messages)
  - [Code Style and ADRs](#code-style-and-adrs)

## Plugins

- [DQL](./plugins/dql/README.md) - A plugin showing DQL query results from
  Dynatrace in Backstage.
- [DQL Backend](./plugins/dql-backend/README.md) - The backend for the DQL
  plugin.
- [DQL Common](./plugins/dql-common/README.md) - Common functionality shared
  between the DQL frontend and backend plugin.

## Getting Started

The repository contains a full Backstage installation at its root, with the
individual plugins in the `plugins` directory. Backstage is configured to
include the plugins, so you can start the app and see them in action.

Create a `app-config.local.yaml` file (excluded by .gitignore) configuring the
connection to the Dynatrace environment:

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

Using the `EntityKubernetesDeploymentsCard` (or the
`dynatrace.kubernetes-workload` query directly), you can see the Kubernetes
deployments in your Dynatrace environment:

Kubernetes pods with a `backstage.io/component` label will be listed for the
corresponding backstage component if they are properly annotated in the
deployment descriptor:

```yaml
backstage.io/component: <backstage-namespace>.<backstage-component-name>
```

You can also register your own custom queries and use them with
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
the context it is executed in. These placeholders are prefixed with `$$` in
order to escape the
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

To be able to render correctly, the DQL must return data conform to the
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
    "A Link": {
      "type": "link",
      "text": "https://backstage.io",
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

To start the app, run:

```sh
yarn install
yarn dev
```

Backstage is pre configured but relies on appropriate data to be available in
the demo Dynatrace environment. See [catalog-info.yaml](./catalog-info.yaml) for
details.

# Contributing

Everyone is welcome to contribute to this repository. See our
[contributing guidelines](./CONTRIBUTING.md), raise
[issues](https://github.com/Dynatrace/backstage-plugin/issues) or to submit a
[pull requests](https://github.com/Dynatrace/backstage-plugin/pulls).
