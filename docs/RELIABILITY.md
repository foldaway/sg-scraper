# Reliability

This Worker publishes data from sources that can change without notice. Treat
external HTML, external APIs, and geocoding results as unreliable boundaries.

## Scraper Rules

- Each scraper should fail loudly when its source layout no longer yields useful
  data.
- Keep selector assumptions local to the scraper for that source.
- Close browser pages after successful scraping.
- In development, keep browser debugging paths easy to use.
- In production, allow independent boba chain failures to publish successful
  chains while logging failures.

## Data Rules

- Preserve existing JSON field names unless a consumer migration is part of the
  task.
- Normalize URLs and timestamps before writing to R2.
- Keep timezone-sensitive logic explicit about Singapore time.
- Prefer typed models in `model.ts` files over ad hoc object shapes.

## Operational Notes

The scheduled Worker runs weekly through `wrangler.jsonc`. Local development
uses Vite and the Cloudflare plugin:

```sh
npm run dev
npm run dev:scheduled-trigger
```
