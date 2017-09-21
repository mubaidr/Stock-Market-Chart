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
    stockCode: 'AMZN',
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
  computed: {},
  methods: {
    stockDataURL(code) {
      return this.stockApi.url + code + this.stockApi.key
    },
    addStock() {
      var _self = this

      this.error = null
      this.loading = true

      if (this.stocks.indexOf(this.stockCode) > -1) {
        this.error = 'This stock code is already added.'
      } else {
        axios.get(this.stockDataURL(this.stockCode)).then(function (res) {
          if (res.data['Meta Data']) {
            _self.socketio.emit('addStock', _self.stockCode)
            _self.stocks.push(_self.stockCode)
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
      this.stocks.forEach(function (element) {
        axios.get(this.stockDataURL(element)).then(function (res) {
          console.log(res)
        }).catch(function (err) {
          console.log('Unable to load data for: ' + element)
        })
      }, this);

      if (callback) callback()
    }
  },
  created() {
    this.setupSocket()
  }
})
