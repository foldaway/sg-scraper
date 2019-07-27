# frozen_string_literal: true

require 'sg/scraper/version'
require_relative './scraper/data_sources/data_source.rb'

module Sg
  # Scraper
  module Scraper
    class Error < StandardError; end

    # @param [String] type of data to scrape
    # @return [Hash]
    def self.scrape(data_type)
      project_root = File.dirname(File.absolute_path(__FILE__))
      Dir.glob(project_root + '/scraper/data_sources/*.rb', &method(:require))

      chosen_class = case data_type
                     when 'boba' then Boba
                     when 'atm' then Atms
                     end

      results = []
      instance = chosen_class.new
      chosen_class.instance_methods(false).each do |m|
        puts "[#{m}] Scraping started"
        data = instance.send(m)
        results.push *data
        puts "[#{m}] Scraped #{data.size} data"
      end
      results
    end
  end
end
