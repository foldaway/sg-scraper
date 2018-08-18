require_relative 'stores'
require_relative './util/onemap'
require 'pry'

def scrape(method_name)
  onemap_client = OneMapClient.new
  data = *Stores.public_send(method_name)

  for shop in data do
    location_search_term = shop.address.scan(/(\d{6})/).flatten.first # Try postcode
    if location_search_term.nil?
      location_search_term = shop.address.gsub(/(#.{1,5}-.{1,3})/i, '') # Try raw address with unit number removed
    end
    location_results = onemap_client.search(location_search_term)
    unless location_results.nil?
      shop.location = location_results.first
    end
    sleep(0.5)
  end

  puts JSON.pretty_generate(data)
end

puts "Type scrape <method_name> to run a scrape and merge it with OneMap location data."
puts "Otherwise, just run Stores.<method_name> which will scrape with no location data"

Pry.start
