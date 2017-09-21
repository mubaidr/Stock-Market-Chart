const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const path = require('path')

const config = require('./config')
const routes = require('./routes')

var stocks = ['AAPL', 'GOOG']

var app = express()
var port = process.env.PORT || config.port

app.use(morgan('dev'))
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))

app.use('/', routes)

var server = require('http').Server(app)
var io = require('socket.io')(server)

io.on('connection', function (socket) {
  socket.emit('stocks', stocks)

  socket.on('addStock', function (data) {
    stocks.push(data)

    socket.broadcast.emit('stocks', stocks);
  })

  socket.on('removeStock', function (data) {
    stocks = stocks.filter(function (item) {
      return item !== data
    })

    socket.broadcast.emit('stocks', stocks);
  })
})

server.listen(port)
