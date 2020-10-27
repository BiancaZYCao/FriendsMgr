const express = require('express')
const router = express.Router()
// split up route handling by features
router.use('/info', require('./info.route'))
router.use('/', (req, res) => res.send({ message: 'this api is alive' }))
// etc.

module.exports = router
