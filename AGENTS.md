# Repository Guidelines

## Project Structure & Module Organization
- **Core streams**: `server.ts` exposes the `typedStream` helper for Hono handlers, while `client.ts` provides the corresponding consumer utilities (`TextLineSplitterStream`, `JSONParserStream`, `receiveTypedStream`).
- **Shared types**: `shared.ts` centralizes the `TYPED_STREAM_KEY` constant to keep server and client typings aligned.
- **Tests**: `client.test.ts` exercises the client transforms and end-to-end flow; add new tests alongside the file they cover to keep scope focused.
- **Configuration**: `deno.json` defines export map, dependencies, and formatter rules; update this file when publishing new entry points or adjusting style.

## Build, Test, and Development Commands
- `deno test`: Runs all Deno test suites, including `client.test.ts`; use `deno test --watch` for rapid iteration.
- `deno fmt`: Applies the repository formatting profile (no semicolons, single quotes); pair with `--check` in CI to prevent drift.
- `deno lint`: Surfacing potential runtime and style issues before review; pass specific paths to limit scope during development.

## Coding Style & Naming Conventions
- **Formatting**: Always format with `deno fmt`; configuration enforces semicolon-free, single-quoted code with two-space indentation.
- **Imports**: Prefer explicit relative imports within the repo and registry specifiers (`npm:`/`jsr:`) for externals.
- **Naming**: Use descriptive, PascalCase for classes, camelCase for functions/constants, and SCREAMING_SNAKE_CASE for exported literal identifiers.
- **Error handling**: Surface stream parsing errors using `controller.error` to bubble failures to consumers.

## Testing Guidelines
- **Framework**: Tests rely on the built-in Deno test runner and stream helpers; leverage `Array.fromAsync` for collecting streaming output.
- **Structure**: Mirror the existing `Deno.test('context', async () => { ... })` pattern and group related assertions per stream behavior.
- **Coverage**: Ensure new streaming scenarios include both success paths and malformed payload cases to prevent regressions.
- **Execution**: Run `deno test --coverage=coverage` when collecting coverage locally; clean the directory before committing artifacts.

## Commit & Pull Request Guidelines
- **Commit style**: No git history is present; follow Conventional Commits (e.g., `feat:`, `fix:`, `chore:`) to keep logs searchable once version control is initialized.
- **Scope notes**: Keep commits small, focused on a single functional change, and reference relevant files in the summary line when practical.
- **Pull requests**: Provide a concise overview, testing notes (`deno test`, `deno fmt --check`), and attach logs or screenshots if the change affects streaming output.
- **Issue linkage**: Reference issue IDs with `Closes #123` syntax to automate closure and aid traceability.

## Agent Workflow Notes
- Favor incremental patches via `apply_patch` to keep diffs reviewable.
- When adding new modules, update the export map in `deno.json` and include a smoke test verifying serialization compatibility.
- Document any new streaming message schema in the PR description to sync upstream clients.
