# sg-scraper
![.github/workflows/run.yml](https://github.com/bottleneckco/sg-scraper/workflows/.github/workflows/run.yml/badge.svg)

Scheduled Cloudflare Worker that scrapes metadata for Singapore places and
publishes static JSON outputs to R2.

## Development

1. Run `npm install`.
2. Run `npm run dev`.
3. Trigger the scheduled handler locally:

   ```sh
   npm run dev:scheduled-trigger
   ```

Useful checks:

```sh
npm run typecheck
npm run check
npm run validate
```

## Agent Harness

This repo is set up with a small agent harness based on OpenAI's harness
engineering research:

- [AGENTS.md](AGENTS.md) is the short entry point for agents.
- [ARCHITECTURE.md](ARCHITECTURE.md) maps runtime flow and source boundaries.
- [docs/README.md](docs/README.md) indexes the versioned knowledge base.
- `npm run validate:harness` checks that the harness remains discoverable.
