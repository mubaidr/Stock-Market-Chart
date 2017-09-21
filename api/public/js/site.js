//eslint-disable-next-line
var app = new Vue({
  el: '#app',
  data: {
    stockApi: {
      url: 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=',
      key: '&apikey=VV1B07RZ6IR451J1'
    },
    stocks: ['AAPL', 'GOOG'],
    stockCode: 'MSFT',
    error: null,
    loading: true
  },
  computed: {
    stockDataURL() {
      return this.stockApi.url + this.stockCode + this.stockApi.key
    }
  },
  methods: {
    addStock() {},
    drawChart() {}
  },
  mounted() {
    console.log('loaded')
  }
})
