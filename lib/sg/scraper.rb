# frozen_string_literal: true

require 'sg/scraper/version'
require_relative './scraper/data_sources/data_source.rb'
require 'rest_client'

module Sg
  # Scraper
  module Scraper
    class Error < StandardError; end

    # @param [String] type of data to scrape
    # @param [String] specific method to call. optional.
    # @return [Hash]
    def self.scrape(data_type, method = nil)
      project_root = File.dirname(File.absolute_path(__FILE__))
      Dir.glob(project_root + '/scraper/data_sources/*.rb', &method(:require))

      chosen_class = case data_type
                     when 'boba' then Boba
                     when 'atm' then Atms
                     end

      results = []
      instance = chosen_class.new
      
      methods = if method.nil?
        chosen_class.instance_methods(false)
      else
        [method.to_sym]
      end
      
      begin
        methods.each do |m|
          puts "[#{m}] Scraping started"
          data = instance.send(m)
          results.push *data
          puts "[#{m}] Scraped #{data.size} data"
        end
      rescue => e
        puts e
        puts e.backtrace

        base64_data = instance.instance_variable_get(:@driver).screenshot_as(:base64)

        response = RestClient.post("https://api.imgbb.com/1/upload?key=b0bffdbc05689196b03fc1d3ae9ad5b4", {
          :image => base64_data,
          :name => "sg-scraper on #{RUBY_PLATFORM}"
        })
        img_url = JSON.parse(response)['data']['url_viewer']
        puts "An error occurred, driver screenshot captured at #{img_url}"
      end
      results
    end
  end
end
