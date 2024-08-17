# Dynatrace DQL Plugin Backend

Package name: `@dynatrace/backstage-plugin-dql-backend`

Welcome to the DQL backend plugin for Dynatrace!

The aim of the plugin is to provide live data from Dynatrace by running DQL
against it.

## Development

The backend can be started locally using `yarn start`, this starts the backend
on [localhost:7007/dql](http://localhost:7007/dql).

## Behind a corporate proxy

If your application is behind a corporate proxy, set `HTTPS_PROXY` as an
environment variable. This will be passed to `HttpsProxyAgent` as `agent` in the
fetch request.

There is another method, you can open firewall for Dynatrace tokenUrl
https://sso.dynatrace.com and https://xxxxxxxx.apps.dynatrace.com. In that case,
you don't need HTTPS_PROXY.
