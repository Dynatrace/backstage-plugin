---
name: update-packages
description: Use this skill when the user asks to "update packages", "upgrade dependencies", "fix vulnerabilities", "run audit", "update deps", or mentions outdated packages in this Backstage plugin project. Handles security vulnerability fixes, Backstage-compatible package upgrades, and verification.
allowed-tools: [Bash, Read, Edit, WebFetch]
---

# update-packages

Update dependencies in this Backstage monorepo (Yarn 4 workspaces) while preserving Backstage version compatibility and fixing security vulnerabilities.

---

## Step 1 — Observe current state

First use the correct node version:

```bash
nvm install
nvm use
```

Optionall enable corepack to have yarn ready:

```bash
corepack enable
```

Run both of these and show the full output to the user before touching anything:

```bash
npm outdated
yarn run audit
```

Note which packages are outdated and which CVEs are reported. Do not proceed with changes until the user has seen this snapshot.

---

## Step 2 — Check Backstage release notes

Read `backstage.json` to get the current Backstage version. Then fetch the release page:

```
https://backstage.io/docs/releases/v<version>
```

Scan for: renamed packages, removed exports, peer dependency changes, required version bumps for React / TypeScript / Jest. This determines what is safe to upgrade and whether any protected-major-version bump is actually required by Backstage. Keep these notes for Steps 3–5.

---

## Step 3 — Fix security vulnerabilities

For each HIGH or CRITICAL vulnerability reported by `yarn run audit`:

1. Identify whether the vulnerable package is a **direct** project dependency or a **transitive** dep pulled in by Backstage or another lib.
2. **Transitive deps (preferred fix):** add or update a `resolutions` entry in the **root** `package.json` to pin the patched version. Use an exact version — no `^` or `~`.
3. **Direct deps owned by this project:** bump the version directly in the relevant workspace `package.json`. Still pin exactly.
4. Do **not** run `yarn install` yet.

---

## Step 4 — Update non-Backstage packages

For every package listed as outdated that is **not** in the `@backstage/*` namespace:

**Protected major-version list** — skip if the update is a major bump (e.g. 18.x → 19.x) for:
- `react`
- `react-router`
- `react-router-dom`
- `typescript`
- `jest`

Exception: if Step 2 showed that the Backstage release explicitly requires a major bump for one of these, **pause and ask the user** before proceeding with that package.

For all other packages: edit the relevant `package.json` to set the exact latest version (no `^` or `~`). Do **not** run `yarn install` yet.

Track skipped packages (name, current version, available version) for the final report.

---

## Step 5 — Handle @backstage/* packages

Do **not** upgrade `@backstage/*` packages on your own initiative. Only do so if:
- The user explicitly asked to upgrade Backstage, OR
- A security vulnerability in Step 3 targets a `@backstage/*` package that must be upgraded

If upgrading Backstage packages, always upgrade them together as a group to the same target version. Pin each to an exact version.

---

## Step 6 — Install and resolve conflicts

After all `package.json` edits (Steps 3–5):

```bash
yarn install
```

If install fails:
1. Read the error to identify the conflicting packages and version ranges
2. Downgrade the conflicting package to the highest mutually-compatible version
3. Edit `package.json` and retry `yarn install`
4. If the conflict cannot be resolved without guessing intent, **stop and ask the user** which package to pin before continuing
5. Never use `--legacy-peer-deps`, `--force`, or similar escape hatches

---

## Step 7 — Verification loop

Run these four commands **sequentially**. On any failure: fix the error, then re-run that command before continuing. Repeat the entire sequence from the top until all four pass cleanly.

```bash
yarn clean
yarn lint:all
yarn tsc:full
yarn test:all
```

**Fix policy:**
- Mechanical fix (renamed import, removed export, updated API signature documented in the changelog or migration output): apply automatically
- Semantic fix (logic change, modified test assertion, restructured component): pause and describe the proposed change to the user, wait for confirmation before applying
- Never suppress errors with `// @ts-ignore`, `eslint-disable`, or similar

---

## Step 8 — Final report

Print a structured summary, as markdown so it is ready to be copied and pasted for a PR's description:

```
=== Package Update Summary ===

Security fixes (resolutions):
  axios: 1.4.0 → 1.15.2  (CVE-2024-XXXX)
  ...

Packages updated:
  @types/node: ^20.0.0 → 22.15.3
  ...

Skipped (major-version protection):
  react: ^18.0.0 → 19.1.0  (skipped — major bump, protected)
  ...

Backstage packages:
  (not upgraded — no Backstage version bump requested)

Verification:
  yarn clean      ✓
  yarn lint:all   ✓ (N errors auto-fixed)
  yarn tsc:full   ✓
  yarn test:all   ✓

Source/test files changed:
  plugins/dql/src/api.ts — updated import path
  ...
```

Print it as markdown so it is ready to be copied and pasted for a PR's description.
