# Dynatrace Kubernetes

Package name: `@dynatrace/backstage-plugin-kubernetes`

Welcome to the Kubernetes plugin for Dynatrace!

The aim of the plugin is to provide live data from Kubernetes workloads tracked
by Dynatrace. It lists all deployments of components configured in Backstage.

The ID of the plugin is `dynatrace-kubernetes` (to not conflict with other
Kubernetes plugins).

The ID of the backend plugin API is set to be
`plugin.dynatrace-kubernetes.service`.

## Getting started

Use `yarn start` to run the plugin in isolation (as configured in the
[/dev](./dev) directory).

The plugin is available via
[localhost:3000/...](http://localhost:3000/catalog/hardening/component/backstage-example).
