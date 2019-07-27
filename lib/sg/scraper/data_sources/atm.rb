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
      
      def dbs
        @driver.navigate.to 'https://www.dbs.com.sg/index/locator.page'
        
        wait = Selenium::WebDriver::Wait.new(timeout: 10) # seconds
        wait.until { @driver.find_element(css: '.jspContainer') }
        
        page_numbers = @driver.find_elements(css: '.navnum')
        
        page_numbers.map { |pg_num_elem|
          pg_num_elem.click
          sleep 0.5
          
          @driver.find_elements(css: 'div.store').map { |item_elem|
            @driver.execute_script('arguments[0].scrollIntoView();', item_elem)
            
            begin
              item_elem.click
              sleep 1
              
              begin
                opening_hours = @driver.find_element(css: '.openhour').text
              rescue NoSuchElementError
                opening_hours = nil
              end
              
              Atm.new(
                item_elem.find_element(css: '.title').text,
                "#{item_elem.find_element(css: '.address').text} #{item_elem.find_element(css: '.postal_code').text}",
                opening_hours,
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