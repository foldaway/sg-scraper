require "selenium-webdriver"
Dir["./stores/*.rb"].each {|file| require file }
require_relative './model/boba_shop'

module Stores
  @driver = Selenium::WebDriver.for :chrome
end
