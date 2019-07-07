require 'selenium-webdriver'

module Sg
  module Scraper
    # Source of data that can be scraped
    module DataSource
      def initialize
        chrome_bin = ENV.fetch('GOOGLE_CHROME_SHIM', nil)
        opts_hash = {}
        opts_hash['binary'] = chrome_bin unless chrome_bin.nil?
        options = Selenium::WebDriver::Chrome::Options.new(opts_hash)
        options.add_argument('--headless') if ENV.key?('GITHUB_TOKEN')
        @driver = Selenium::WebDriver.for :chrome, options: options
      end
    end
  end
end
