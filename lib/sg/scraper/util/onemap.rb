require 'httparty'

class OneMapClient
  include HTTParty
  base_uri 'https://developers.onemap.sg'

  def base_path
    '/commonapi'
  end

  def search(term)
    self.class.get("#{base_path}/search", {
      query: {
        searchVal: term,
        returnGeom: 'Y',
        getAddrDetails: 'N',
        pageNum: 1
      }
    })['results']
  end
end
