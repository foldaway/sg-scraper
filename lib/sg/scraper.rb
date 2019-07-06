require 'sg/scraper/version'

module Sg
  module Scraper
    class Error < StandardError; end
    
    def scrape(data_type)
      redis = Redis.new
      redis.select 1

      mods = case data_type
                      when 'boba' then Boba
                      end

      methods = chosen_module.methods(false)
      methods.each do |m|
        puts "[#{m}] Scraping started"
        shops = Boba.public_send(m)
        data.push *shops
        puts "[#{m}] Scraped #{shops.size} shops"
      end

      for data_source in data do
      end
    end
  end
end
