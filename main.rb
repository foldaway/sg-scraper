require 'fileutils'
require_relative 'boba'
require_relative './util/onemap'

data = Array.new
onemap_client = OneMapClient.new

methods = Boba.methods(false)
methods.each do |m|
  puts "[#{m}] Scraping started"
  shops = Boba.public_send(m)
  data.push *shops
  puts "[#{m}] Scraped #{shops.size} shops"
end

for shop in data do
  location_search_term = shop.address.scan(/(\d{6})/).flatten.first # Try postcode
  if location_search_term.nil?
    location_search_term = shop.address.gsub(/(#.{1,5}-.{1,3})/i, '') # Try raw address with unit number removed
  end
  location_results = onemap_client.search(location_search_term)
  unless location_results.nil?
    shop.location = location_results.first
  end
  puts "[OneMap] '#{location_search_term}' => #{JSON.generate(shop.location)}"
  sleep(0.5)
end

Dir.mkdir('temp') unless File.exists?('temp')
File.delete('temp/data.json') if File.exists?('temp/data.json')
File.write('temp/data.json', JSON.pretty_generate(data))

%x(dpl --provider=pages --committer-from-gh --github-token=$GITHUB_TOKEN --repo=$GITHUB_REPO --local-dir=temp)

FileUtils.remove_dir('temp')
