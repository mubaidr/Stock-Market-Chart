/* global io, axios, Vue*/
//eslint-disable-next-line
var app = new Vue({
  el: '#app',
  data: {
    stockApi: {
      url: 'https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=',
      key: '&apikey=VV1B07RZ6IR451J1'
    },
    stocks: [],
    stocksData: {},
    stockCode: 'MSFT',
    error: null,
    loading: true,
    socketio: null
  },
  watch: {
    'stockCode' () {
      this.error = ''
    },
    'stocks' (newStocks, oldStocks) {
      var _self = this

      this.refreshChart(function () {
        _self.loading = false
      })
    }
  },
  computed: {
    stockDataURL() {
      return this.stockApi.url + this.stockCode + this.stockApi.key
    }
  },
  methods: {
    addStock() {
      var _self = this

      _self.error = null
      _self.loading = true

      if (_self.stocks.indexOf(this.stockCode) > -1) {
        _self.error = 'This stock code is already added.'
      } else {
        axios.get(this.stockDataURL).then(function (res) {
          if (res.data.Meta) {
            _self.socketio.emit('addStock', this.stockCode)
            _self.stocks.push(this.stockCode)
            _self.stockCode = ''
          } else {
            _self.error = 'Invalid Stock Code'
          }
        }).catch(function (err) {
          _self.error = 'Unable to connect API server.'
        })
      }
    },
    removeStock(code) {
      this.stocks = this.stocks.filter(function (item) {
        return item !== code
      })
      this.socketio.emit('removeStock', code)
    },
    setupSocket() {
      var _self = this
      this.socketio = io.connect(location.href)

      this.socketio.on('stocks', function (data) {
        _self.stocks = data
      })

      this.socketio.on('removeStock', function (data) {
        _self.stocks = _self.stocks.filter(function (item) {
          return item !== data
        })
      })
    },
    refreshChart(callback) {
      console.log(this.stocks)

      if (callback) callback()
    }
  },
  created() {
    this.setupSocket()
  }
})
