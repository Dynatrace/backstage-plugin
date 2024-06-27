# Dynatrace DQL Plugin Backend

Package name: `@dynatrace/backstage-plugin-dql-backend`

Welcome to the DQL backend plugin for Dynatrace!

The aim of the plugin is to provide live data from Dynatrace by running DQL
against it.

## Development

The backend can be started locally using `yarn start`, this starts the backend
on [localhost:7007/dql](http://localhost:7007/dql).

## Behind a corporate proxy

If you are application is behind a corporate proxy. set HTTP_PROXY as
environment variable. It will pass to HttpsProxyAgent in fetch request.
