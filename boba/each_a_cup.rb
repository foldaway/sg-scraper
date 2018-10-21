module Boba
  def self.each_a_cup
    title_regex = Regexp.new('\(([\w\s]*)\)')

    ['Central', 'North', 'West', 'East'].map { |region|
      @driver.navigate.to "http://www.each-a-cup.com/home/outlets/#{region}"

      wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
      wait.until { @driver.find_element(css: '.service-item') }
      items = @driver.find_elements(css: '.service-item')
      sleep(0.2)

      items.map { |item_elem|
        raw_title = item_elem.find_element(css: 'h3').text
        title_set = title_regex.match(raw_title)
        title = title_set == nil ? raw_title : title_set[1]

        BobaShop.new(
          title,
          item_elem.find_elements(css: 'p').first.text,
          item_elem.find_elements(css: 'p')[1].text,
          nil,
          'Each-a-Cup'
        )
        }.reject { |shop| shop.title.empty? }
    }.flatten
  end
end
