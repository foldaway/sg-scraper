#!/bin/sh

# mkdir temp
# bundle exec ruby main.rb > temp/data.json
bundle exec dpl --provider=pages --committer-from-gh=true --github-token=$GITHUB_TOKEN --repo=$GITHUB_REPO --local-dir=temp
# rm -Rf temp
