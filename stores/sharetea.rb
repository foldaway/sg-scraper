module Stores
  def self.sharetea
    @driver.navigate.to 'http://www.1992sharetea.com/store.php'

    wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
    wait.until { @driver.find_element(css: '#nCS1') }

    # Select Singapore
    option = Selenium::WebDriver::Support::Select.new(@driver.find_element(css: '#nCS1'))
    option.select_by(:text, 'Singapore')

    locations_box = @driver.find_element(css: '#locations-box')
    locations_box_html = locations_box.attribute('innerHTML')

    wait.until { locations_box.attribute('innerHTML') != locations_box_html }
    items = @driver.find_elements(css: '.locatBox')
    
    items.map { |item_elem|
      BobaShop.new(
        item_elem.find_element(css: 'h4').text,
        item_elem.find_element(css: '.addr').text,
        nil,
        nil,
        'Sharetea'
      )
      }.reject { |shop| shop.title.empty? }
  end
end
