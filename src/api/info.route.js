const express = require('express')
const infoRouter = express.Router()
const configJson = require('../config.json')
VERSION = configJson.version
ALL_TYPES = configJson.relationship_type

//GET /app version
infoRouter.route('/version').get((req, res) => {
  return res.status(200).send(VERSION)
})

//GET /relationshipTypes
infoRouter.route('/relationshipTypes').get((req, res) => {
  return res.status(200).send(ALL_TYPES)
})

module.exports = infoRouter
