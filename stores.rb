require "selenium-webdriver"
Dir["./stores/*.rb"].each {|file| require file }
require_relative './model/boba_shop'

module Stores
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--headless')
  @driver = Selenium::WebDriver.for :chrome, options: options
end
