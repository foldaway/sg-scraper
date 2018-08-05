require_relative 'stores'
require_relative './util/onemap'
require 'pry'

data = Hash.new
onemap_client = OneMapClient.new

methods = Stores.methods(false)
methods.each do |m|
  data[m] = Stores.public_send(m)
end

data.each do |boba_chain, shops|
  for shop in shops do
    shop.location = onemap_client.search(
      shop.address.scan(/(\d{6})/).flatten.first
    ).first
    sleep(0.1)
  end
end

binding.pry
