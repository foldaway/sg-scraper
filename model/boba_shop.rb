class BobaShop
  attr_reader :title
  attr_reader :address
  attr_reader :phone
  attr_reader :opening_hours
  attr_accessor :location

  def initialize(title, address, phone, opening_hours)
    @title = title
    @address = address
    @phone = phone
    @opening_hours = opening_hours
    @location = nil
  end
end
