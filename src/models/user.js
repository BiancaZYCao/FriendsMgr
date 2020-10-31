const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String },
  name: { type: String },
  friendsList: { type: [] },
  blockList: { type: [] },
  subscriptionList: { type: [] },
})
const User = mongoose.model('User', userSchema, 'users')
module.exports = User

// const relationshipSchema = new mongoose.Schema({
//   emailhost: { type: String, required: true },
//   emailguest: { type: String, required: true },
//   friendship: { type: Boolean, default: true },
//   isBlocked: { type: Boolean, default: false },
//   subscribe: { type: Boolean, default: false },
// })

//.model(modelName,Schema object,ColletionName)
// const Relationship = mongoose.model(
//   'Relationship',
//   relationshipSchema,
//   'relationships'
// )

// module.exports = Relationship
