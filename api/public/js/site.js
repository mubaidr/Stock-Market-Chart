//eslint-disable-next-line
var app = new Vue({
  el: '#app',
  data: {
    stocks: ['AAPL', 'GOOG'],
    stockCode: '',
    error: null,
    loading: true
  },
  methods: {
    addStock() {},
    drawChart() {}
  },
  mounted() {
    console.log('loaded')
  }
})
