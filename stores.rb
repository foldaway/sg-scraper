require "selenium-webdriver"
Dir["./stores/*.rb"].each {|file| require file }
require_relative './model/boba_shop'

module Stores
  chrome_bin = ENV.fetch('GOOGLE_CHROME_SHIM', nil)
  options = Selenium::WebDriver::Chrome::Options.new(chrome_bin ? { binary: chrome_bin } : {})
  options.add_argument('--headless')
  @driver = Selenium::WebDriver.for :chrome, options: options
end
