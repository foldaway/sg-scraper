require_relative 'stores'
require_relative './util/onemap'
require 'pry'

def scrape(method_name)
  onemap_client = OneMapClient.new
  methods = Stores.methods(false)
  data = *Stores.public_send(method_name)

  for shop in data do
    post_code = shop.address.scan(/(\d{6})/).flatten.first
    shop.location = onemap_client.search(post_code).first
    sleep(0.5)
  end

  puts JSON.pretty_generate(data)
end

puts "Type scrape <method_name> to run a scrape and merge it with OneMap location data."
puts "Otherwise, just run Stores.<method_name> which will scrape with no location data"

Pry.start
