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
        @driver = Selenium::WebDriver.for :chrome, options: options
      end
    end
  end
end
