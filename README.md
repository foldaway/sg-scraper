# sg-scraper
Scripts to scrape metadata of places in Singapore.

### Development
1. Run `yarn install`
2. Run `docker-compose up` to spin up an instance of PostgreSQL (main data store), Redis (for OneMap caching) and GraphQL API server.
3. Run `yarn dev:scrape` to start the scraper. In non-production environments, this will launch Chromium.
  Adjust `scraper.ts` accordingly for testing purposes (e.g. disable other sources in order to save time)
