# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Contributor License Agreement

Contributions to this project must be accompanied by a Contributor License
Agreement. You (or your employer) retain the copyright to your contribution;
this simply gives us permission to use and redistribute your contributions as
part of the project.

You generally only need to submit a CLA once, so if you've already submitted one
(even if it was for a different project), you probably don't need to do it
again.

## Code Reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Prerequisites and installation

Please find the getting started guide, installation detail, and more in the
[README](README.md) of the repository.

- If you haven't already,
  [install Backstage](https://backstage.io/docs/getting-started/create-an-app).

- Setup npm to use the GitHub Package Registry as described
  [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package).
  (in short, run
  `npm login --registry https://npm.pkg.github.com --scope @dynatrace` with your
  GitHub personal access token)

- Follow the [Getting Started](README.md/#getting-started).

## Development

After your initial checkout, run `yarn install` to get the project set up. This
also installs Husky hooks, which will run on every commit. If the Husky
installation fails, use `yarn prepare` to install the hooks manually.

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

```commit
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
E.g. `fix(dql): fix a bug in the DQL plugin`.

Commitlint ensures that the package is one of the known Lerna packages.

### Code Style and ADRs

We aim to adhere to the
[Architecture Decision Records](https://github.com/backstage/backstage/tree/master/docs/architecture-decisions)
compiled by the Backstage team.

The ADRs with the most impact on development are:

- [ADR003](https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr003-avoid-default-exports.md):
  Avoid default exports
- [ADR004](https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr004-module-export-structure.md):
  Export components using traceable `index.ts` files.
- [ADR006](https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr006-avoid-react-fc.md):
  Avoid `React.FC` and `React.SFC`.
- [ADR007](https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr007-use-msw-to-mock-service-requests.md):
  Use [msw](https://mswjs.io/) to mock service requests (avoid mocking of
  `fetch`).
- [ADR010](https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr010-luxon-date-library.md):
  Use [Luxon](https://moment.github.io/luxon/) for date/time handling.
- [ADR012](https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr012-use-luxon-locale-and-date-presets.md):
  Use Luxon's `toLocaleString` when formatting dates.
- [ADR011](https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr011-plugin-package-structure.md):
  Use a specific package structure for plugins.
- [ADR013](https://github.com/backstage/backstage/blob/master/docs/architecture-decisions/adr013-use-node-fetch.md):
  Use [node-fetch](https://www.npmjs.com/package/node-fetch) in Backend
  packages, stick to `fetchApiRef` in Frontend packages.

Besides that, we aim to provide a consistent codebase, thus we add the following
soft-rules:

- Prefer `type` over `interface` for type definitions.
- Prefer fat arrow functions over `function` keyword.
- Use camel case for module (file) names.

## Testing

Backstage uses Jest for all unit testing needs. Please provide thorough test
coverage accordingly.

Start the tests from within your plugin directory with `npm run test`
