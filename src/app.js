const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
//use mongoose connecting to mongoDB
// const mongoose = require('mongoose')
// mongoose
//   .connect('mongodb://localhost:27017/friendslist', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log('Connected to local MongoDB!')
//   })
//   .catch((err) => {
//     console.log('Cannot connect to the database', err)
//     process.exit()
//   })

require('dotenv').config()

const middlewares = require('./middlewares')

const app = express()

app.use(morgan('dev')).use(helmet()).use(cors())
app.use(express.json())

//import bodyParser to encode request body
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// new-created route for projectJson
const apiRoute = require('./api/api.route.js')
app.use('/', apiRoute)

app.use(middlewares.notFound).use(middlewares.errorHandler)

module.exports = app
