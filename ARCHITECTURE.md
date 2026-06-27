# Architecture

`sg-scraper` is a scheduled Cloudflare Worker that scrapes Singapore place
metadata and publishes static JSON plus an index page to R2.

## Runtime Flow

1. Cloudflare invokes the scheduled handler in `src/index.ts`.
2. The handler launches Cloudflare Browser Rendering with Puppeteer.
3. Boba scrapers read chain websites and normalize results into `Boba`.
4. The hawker scraper reads a data.gov.sg dataset and normalizes results into
   `Hawker`.
5. Outputs are written to the configured R2 bucket.
6. `src/templates/index.mustache` renders a generated index page listing output
   files and build host metadata.

## Source Boundaries

- `src/index.ts` owns orchestration, partial-failure handling, and publishing.
- `src/sources/boba/` owns boba chain scrapers and boba data models.
- `src/sources/hawker/` owns hawker data ingestion and hawker data models.
- `src/location/` and `src/onemap/` own address lookup and OneMap integration.
- `src/util/` contains shared helpers for external APIs and data shaping.
- `src/templates/` contains output templates only.

## Dependency Direction

Scrapers may depend on shared utilities and models. Shared utilities should not
depend on individual scrapers. Runtime orchestration may depend on scrapers, but
scrapers should not import runtime orchestration from `src/index.ts`.

## External Boundaries

- Boba websites are unstable browser-scraped HTML surfaces.
- data.gov.sg records are fetched through `src/util/data-gov-api.ts`.
- OneMap lookup goes through the configured proxy in `src/onemap/onemap.ts`.
- Cloudflare bindings are read through `cloudflare:workers`.

Validate external shapes as close to these boundaries as possible. When a site
or API changes, update the local scraper and add or refresh the smallest
assertion that proves the expected data is still present.
