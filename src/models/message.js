const mongoose = require('mongoose')
const msgSchema = new mongoose.Schema({
  sendFrom: { type: String, required: true },
  sendTo: { type: String },
  message: { type: String },
  mentionedList: { type: [] },
})

const Msg = mongoose.model('Msg', msgSchema, 'msgs')

module.exports = Msg
