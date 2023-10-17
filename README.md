# Dynatrace Backstage Plugins

This repository contains a collection of Backstage plugins for Dynatrace.

- [Dynatrace Backstage Plugins](#dynatrace-backstage-plugins)
  - [Plugins](#plugins)
  - [Getting Started](#getting-started)
  - [Development](#development)
    - [(Conventional) Commit Messages](#conventional-commit-messages)

## Plugins

- [Kubernetes](./plugins/kubernetes/README.md) - A plugin add Kubernetes
  workloads managed in Dynatrace into Backstage.
- [Kubernetes Backend](./plugins/kubernetes-backend/README.md) - The backend for
  the Kubernetes plugin.
- [Kubernetes Common](./plugins/kubernetes-common/README.md) - Common
  functionality shared between the frontend and backend plugin.

## Getting Started

The repository contains a full Backstage installation at its root, with the
individual plugins in the `plugins` directory. Backstage is configured to
include the plugins, so you can start the app and see them in action.

To start the app, run:

```sh
yarn install
yarn dev
```

Backstage is configured to be self documenting, it includes the catalog
information for the plugins. You can see the catalog at
http://localhost:3000/catalog.

## Contributing

## Development

We use a small set of tools to keep the repository tidy and promote best
practices:

- [Prettier](https://prettier.io/) - Code formatter
- [ESLint](https://eslint.org/) - Linter
- [Lerna](https://lerna.js.org/) - Monorepo management
- [Lint Staged](https://github.com/lint-staged/lint-staged#readme) - Run linters
  on staged files
- [Husky](https://typicode.github.io/husky/#/) - Git hooks
- [Commitlint](https://commitlint.js.org/#/) - Commit message linting
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) -
  Commit message format
- Automated versioning and changelog generation (pending, either using
  [Commitizen](https://github.com/commitizen/cz-cli) or
  [Semantic Release](https://github.com/semantic-release/semantic-release) or
  even just Lerna)

### (Conventional) Commit Messages

To simplify semantic versioning and changelog generation, we use
[conventional commits](https://www.conventionalcommits.org/en/v1.0.0/). This
means that commit messages should follow a specific format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

To keep it simple, we recommend a reduced set of allowed types (though, all
[conventional commit types](https://www.conventionalcommits.org/en/v1.0.0/#summary)
are allowed):

- `fix` or `fix!`: A (breaking) bug fix; influences the patch version (resp.
  major version, if breaking)
- `feat` or `feat!`: A (breaking) new feature; influences the minor version
  (resp. major version, if breaking)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `docs`: Documentation only changes
- `chore`: Anything else

The optional scope should be the name of the package affected by the change.
E.g. `fix(kubernetes): fix a bug in the Kubernetes plugin`.

Commitlint ensures that the package is one of the known Lerna packages.
