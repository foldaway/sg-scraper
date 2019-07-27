require_relative './data_source.rb'
require_relative '../util/onemap'

module Sg
  module Scraper
    class Atm
      attr_reader :location
      attr_reader :address
      attr_reader :business_hours
      
      attr_reader :bank
      
      def initialize(location, address, business_hours, bank)
        @location = location
        @address = address
        @business_hours = business_hours
        @bank = bank
      end
      
      def to_json(_options = {})
        {
          location: @location,
          address: @address,
          business_hours: @business_hours,
          bank: @bank
        }.to_json
      end
    end
    
    class Atms
      include DataSource
      
      def initialize
        super
      end
      
      def ocbc
        @driver.navigate.to 'https://www.ocbc.com/personal-banking/locate-us.html'
        
        wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
        wait.until { @driver.find_element(css: '#tab2') }
        
        list_view_button = @driver.find_element(css: '#tab2')
        @driver.execute_script('arguments[0].scrollIntoView();', list_view_button)
        
        list_view_button.click # List View
        
        branches = @driver.find_elements(css: '.address-column')
        
        branches.map { |branch_elem|
          Atm.new(
            branch_elem.find_element(css: 'strong').text,
            branch_elem.find_element(css: 'font').text,
            '24/7',
            'OCBC'
          )
        }
      end
      
      def dbs
        @driver.navigate.to 'https://www.dbs.com.sg/index/locator.page'
        
        wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
        wait.until { @driver.find_element(css: '.jspContainer') }
        
        require 'pry'
        binding.pry
        
        # Set to ATMs only
        wait.until { @driver.find_element(css: '#selectBranch') }
        @driver.find_element(css: '#selectBranch').click
        
        @driver.find_element(css: 'div[name="DBS"] .service-name').click
        @driver.find_element(css: 'div[name="DL"] .service-name').click
        @driver.find_element(css: 'div[name="ATM"] .service-name').click
        @driver.find_element(css: '#listClose').click
        
        page_numbers = @driver.find_elements(css: '.navnum')
        
        page_numbers.map { |pg_num_elem|
          pg_num_elem.click
          sleep 0.2
          
          @driver.find_elements(css: 'div.store').map { |item_elem|
            begin
              @driver.execute_script('arguments[0].scrollIntoView();', item_elem)
              
              Atm.new(
                item_elem.find_element(css: '.title').text,
                "#{item_elem.find_element(css: '.address').text} #{item_elem.find_element(css: '.postal_code').text}",
                '24/7',
                'DBS'
              )
            rescue Exception => e
              puts e
            end
          }
        }.flatten
      end
    end
  end
end