module Stores
  def self.blackball
    @driver.navigate.to 'http://blackball.com.sg/index.php/outlet-location/'

    wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
    wait.until { @driver.find_element(css: '.location') }
    items = @driver.find_elements(css: '.location')
    
    items.map { |item_elem|
      BobaShop.new(
        item_elem.find_element(css: '.location-title-pro').text,
        item_elem.find_element(css: '.location-address-pro').text,
        nil,
        item_elem.find_element(css: '.location-time-pro').text,
        'BlackBall'
      )
      }.reject { |shop| shop.title.empty? }
  end
end
