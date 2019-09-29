require 'selenium-webdriver'

module Sg
  module Scraper
    # Source of data that can be scraped
    module DataSource
      def initialize
        chrome_bin = ENV.fetch('GOOGLE_CHROME_SHIM', nil)
        options = Selenium::WebDriver::Chrome::Options.new
        options.add_option('binary', chrome_bin) unless chrome_bin.nil?
        options.add_argument('--headless') if ENV.key?('GITHUB_TOKEN')
        options.add_argument('--window-size=1920,1920')
        options.add_argument('--disable-dev-shm-usage')
        @driver = Selenium::WebDriver.for :chrome, options: options
        @onemap_client = OneMapClient.new
      end
      
      private
      
      # Lookup a location
      # @param [String] raw_text
      def lookup_location(raw_text)
        redis = Redis.new
        redis.select 1

        location_results = if redis.exists(raw_text)
                             [JSON.parse(redis.get(raw_text))]
                           else
                             @onemap_client.search(raw_text)
                           end
        redis.set(raw_text, location_results.first.to_json)
        puts "[OneMap] '#{raw_text}' => #{JSON.generate(location_results.first)}"
        sleep 0.3
        redis.close
        location_results
      end

    end
  end
end
