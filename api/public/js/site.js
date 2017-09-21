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
    stocksData: [],
    stockCode: 'AMZN',
    error: null,
    loading: true,
    socketio: null,
    chart: null
  },
  watch: {
    'stockCode' () {
      this.error = ''
    },
    'stocks' () {
      this.refreshChartData()
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
        }).then(function () {
          _self.loading = false
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
    refreshChartData() {
      var _self = this

      this.stocks.forEach(function (element) {
        axios.get(this.stockDataURL(element)).then(function (res) {
          _self.addToChart(res.data)
        }).catch(function (err) {
          console.log('Unable to load data for: ' + element)
        })
      }, this);
    },
    addToChart(stockData) {
      var _self = this
      //TODO get data/labels in correct format
      console.log(stockData)

      this.chart.data.labels.push(stockData['Meta Data']['2. Symbol'])
      this.chart.data.datasets.forEach((dataset) => {
        dataset.data.push(stockData)
      })
      this.chart.update()
    },
    initiateChart() {
      this.chart = new Chart(this.$refs.myChart, {
        type: 'line',
        data: {
          labels: [],
          datasets: []
        },
        options: {}
      })
    }
  },
  mounted() {
    this.initiateChart()
  },
  created() {
    this.setupSocket()
  }
})
