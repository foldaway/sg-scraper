module Stores
  def self.sharetea
    @driver.navigate.to 'http://www.1992sharetea.com/store.php'

    wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
    wait.until { @driver.find_element(css: '#nCS1') }

    country_select = @driver.find_element(css: '#nCS1')
    city_select = @driver.find_element(css: '#nCS2')
    country_dropdown = Selenium::WebDriver::Support::Select.new(country_select)
    city_dropdown = Selenium::WebDriver::Support::Select.new(city_select)

    # Set country and city
    country_dropdown.select_by(:text, 'Singapore')
    sleep 1
    city_dropdown.select_by(:index, 0)

    sleep 1
    items = @driver.find_elements(css: '.locatBox')
    
    items.map { |item_elem|
      address = item_elem.find_element(css: '.addr').text
      BobaShop.new(
        item_elem.find_element(css: 'h4').text,
        address.gsub(/Woodlabd/i, 'Woodlands'),
        nil,
        nil,
        'Sharetea'
      )
    }.reject { |shop| shop.title.empty? }
  end
end
