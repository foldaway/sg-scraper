require "selenium-webdriver"
Dir["./boba/*.rb"].each {|file| require file }
require_relative './model/boba_shop'

module Boba
  chrome_bin = ENV.fetch('GOOGLE_CHROME_SHIM', nil)
  options = Selenium::WebDriver::Chrome::Options.new(chrome_bin ? { binary: chrome_bin } : {})
  if ENV.has_key?('GITHUB_TOKEN')
    options.add_argument('--headless')
  end
  @driver = Selenium::WebDriver.for :chrome, options: options
end
