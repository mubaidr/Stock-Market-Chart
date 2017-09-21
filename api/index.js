const bodyParser = require('body-parser')
const cors = require('cors')
const express = require('express')
const morgan = require('morgan')
const path = require('path')

const config = require('./config')
const routes = require('./routes')

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

app.listen(port)
