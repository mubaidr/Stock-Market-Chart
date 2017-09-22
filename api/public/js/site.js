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
    chart: null,
    chartedStock: []
  },
  watch: {
    'stockCode' () {
      this.error = ''
    },
    'stocks' () {
      this.refreshChartData()
      this.loading = false
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
        this.loading = false
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
      this.removeFromChart(code)
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
          console.log('Unable to load data for: ' + element, err)
        })
      }, this);
    },
    addToChart(stockData) {
      var code = stockData['Meta Data']['2. Symbol']
      var dates = Object.keys(stockData['Monthly Time Series'])
      if (this.chartedStock.indexOf(code) > -1) return
      if (this.chart.data.labels.length < dates.length) {
        this.chart.data.labels = dates
      }
      this.chartedStock.push(code)

      var randColor = this.getRandomColor()

      var dataSet = {
        data: [],
        label: code,
        fill: false,
        borderColor: '#2c3e50',
        backgroundColor: randColor
      }

      dates.forEach(function (date) {
        dataSet.data.push(stockData['Monthly Time Series'][date]['4. close'])
      })

      this.chart.data.datasets.push(dataSet)
      this.chart.update()
    },
    removeFromChart(code) {
      var index = this.chartedStock.indexOf(code)

      if (index === -1) return

      this.chartedStock.splice(index, 1)
      this.chart.data.datasets.splice(index, 1)
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
    },
    getRandomColor() {
      var letters = '0123456789ABCDEF'.split('')
      var color = '#'
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
      }
      return color
    }
  },
  mounted() {
    this.initiateChart()
  },
  created() {
    this.setupSocket()
  }
})
