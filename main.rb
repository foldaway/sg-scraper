require_relative 'stores'
require_relative './util/onemap'

data = Array.new
onemap_client = OneMapClient.new

methods = Stores.methods(false)
methods.each do |m|
  data.push *Stores.public_send(m)
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
  sleep(0.5)
end

puts JSON.pretty_generate(data)
