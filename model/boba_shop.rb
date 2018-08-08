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

  def to_json(options = {})
    {
      :title => @title,
      :address => @address,
      :phone => @phone,
      :opening_hours => @opening_hours,
      :location => @location,
      :chain => @chain
    }.to_json
  end
end
