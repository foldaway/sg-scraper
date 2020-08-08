#!/bin/sh

echo "Welcome"
echo "Running dev:scrape once"

yarn db:migrate
yarn dev:scrape
