module Stores
  def self.koi
    @driver.navigate.to 'https://www.koithe.com/en/global/koi-singapore'

    wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
    wait.until { @driver.find_element(css: '.global-wrap .item') }
    items = @driver.find_elements(css: '.global-wrap .item')
    
    items.map { |item_elem|
      BobaShop.new(
        item_elem.find_element(css: '.titlebox').text,
        item_elem.find_element(css: '.txt a').text,
        item_elem.find_element(css: '.txt').text,
        nil
      )
    }.reject { |shop| shop.title.empty? }
  end
end
