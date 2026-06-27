# Quality

Quality checks should be executable and discoverable. Prefer adding a small
validation script over repeating the same review comment.

## Standard Commands

```sh
npm run typecheck
npm run check
npm run validate:harness
npm run validate
```

## Review Bar

- Output schema changes are intentional and documented.
- Scrapers assert that they found meaningful data before publishing results.
- External API and browser-scraped assumptions are close to the boundary where
  data enters the system.
- Partial failures remain visible in logs.
- Generated output, caches, and dependency directories are not committed.

## Commits

- Commit messages follow Conventional Commits:
  `type(optional-scope): concise imperative summary`.
- Prefer `feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, and `chore`
  as commit types.
- Agent-authored commits include a `Co-Authored-By` trailer for the agent in the
  commit body.

## Harness Checks

`scripts/validate-agent-harness.mjs` verifies that the agent entry point,
knowledge base docs, plan directories, and package validation scripts stay in
place. Extend it when another repository rule becomes mechanical.
