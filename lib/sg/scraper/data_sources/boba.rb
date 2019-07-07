require_relative './data_source.rb'

# Represents a bubble tea shop
module Sg
  module Scraper
    class BobaShop
      attr_reader :title
      attr_reader :address
      attr_reader :phone
      attr_reader :opening_hours
      attr_accessor :location
      attr_accessor :chain

      def initialize(title, address, phone, opening_hours, chain)
        @title = title
        @address = address
        @phone = phone
        @opening_hours = opening_hours
        @location = nil
        @chain = chain
      end

      def to_json(_options = {})
        {
          title: @title,
          address: @address,
          phone: @phone,
          opening_hours: @opening_hours,
          location: @location,
          chain: @chain
        }.to_json
      end
    end

    # Represents the Boba data source
    class Boba
      include DataSource

      def blackball
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

      def each_a_cup
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

      def gong_cha
        # Gong Cha
        @driver.navigate.to 'http://www.gong-cha-sg.com/stores/'

        wait = Selenium::WebDriver::Wait.new(timeout: 20) # seconds
        wait.until { @driver.find_element(css: '.item') }
        items = @driver.find_elements(css: '.item')

        items.map { |item_elem|
          BobaShop.new(
            item_elem.find_element(css: '.p-title').text,
            item_elem.find_element(css: '.p-area').text,
            nil,
            item_elem.find_element(css: '.p-time').text,
            'Gong Cha'
          )
        }.reject { |shop| shop.title.empty? }
      end

      def koi
        @driver.navigate.to 'https://www.koithe.com/en/global/koi-singapore'

        wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
        wait.until { @driver.find_element(css: '.global-wrap .item') }
        items = @driver.find_elements(css: '.global-wrap .item')

        items.map { |item_elem|
          BobaShop.new(
            item_elem.find_element(css: '.titlebox').text,
            item_elem.find_element(css: '.txt a').text,
            item_elem.find_element(css: '.txt').text,
            nil,
            'Koi'
          )
        }.reject { |shop| shop.title.empty? }
      end

      def liho
        @driver.navigate.to 'http://www.streetdirectory.com/businessfinder/company_branch/163304/5890/'

        wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
        wait.until { @driver.find_element(css: '#company_branch_container tr[id]') }
        items = @driver.find_elements(css: '#company_branch_container tr[id]')

        items.map { |item_elem|
          BobaShop.new(
            item_elem.find_element(css: '.company_branch_name').text,
            item_elem.find_element(css: '.company_branch_address').text,
            item_elem.find_elements(css: '.company_branch_phone').any? ?
              item_elem.find_element(css: '.company_branch_phone').text.scan(/Tel.+?:\s?(.+)/).flatten.first
              : nil,
            nil,
            'LiHO'
          )
        }.reject { |shop| shop.title.empty? }
      end

      def sharetea
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
  end
end
