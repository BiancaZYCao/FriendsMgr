const User = require('./user')
const CODE = require('../common.json').code
const e = require('express')

const createConn = async (inputObject) => {
  try {
    //get user from email (host and guest)
    const [emailHost, emailGuest] = inputObject.friends
    let userHost = await User.findOne({
      email: emailHost,
    }).exec()
    let userGuest = await User.findOne({
      email: emailGuest,
    }).exec()
    // console.log(userHost)
    // console.log(userGuest)

    //host blockList if have guest then return "fail to add friends"
    if (userHost) {
      if (userHost.blockList.indexOf(emailGuest) > -1) {
        return {
          code: CODE.LOGICAL_FAILURE,
          message: 'One of them have blocked the other.',
        }
      }
    }
    //guset blocklist if have host then return "fail to add friends"
    if (userGuest) {
      if (userGuest.blockList.indexOf(emailHost) > -1) {
        return {
          code: CODE.LOGICAL_FAILURE,
          message: 'One of them have blocked the other.',
        }
      }
    }
    //host friendList if no guest then add guest into host-frds
    //guset friendList if no host then add guest into host-frds
    if (userHost) {
      if (userHost.friendsList.indexOf(emailGuest) == -1) {
        userHost.friendsList.push(emailGuest)
        userHost.save()
      } else {
        return {
          code: CODE.LOGICAL_FAILURE,
          message: 'Friendship has been created already.',
        }
      }
    } else {
      //if host/guest does not exist then create user and add frdList
      //   console.log('users do not exist. Need to create new users')
      const newUserHost = new User({
        email: emailHost,
        friendsList: [emailGuest],
      })
      newUserHost.save()
    }
    if (userGuest) {
      if (userGuest.friendsList.indexOf(emailHost) == -1) {
        userGuest.friendsList.push(emailHost)
        userGuest.save()
      }
    } else {
      //   console.log('users do not exist. Need to create new users')
      const newUserGuest = new User({
        email: emailGuest,
        friendsList: [emailHost],
      })
      newUserGuest.save()
    }
    return {
      code: CODE.SUCCESS,
      message: 'Adding new connection to DB.',
    }
  } catch (err) {
    console.error('err')
    return {
      error: err,
      code: CODE.DATA_MANIPULATION_ERROR,
    }
  }
}

const getFrds = async (userEmail) => {
  try {
    const result = await User.findOne({ email: userEmail }).exec()
    if (!result)
      return {
        code: CODE.SUCCESS,
        friendsList: [],
      }
    else
      return {
        code: CODE.SUCCESS,
        friendsList: result.friendsList,
      }
  } catch (err) {
    return {
      error: err,
      code: CODE.DATA_QUERY_ERROR,
    }
  }
}

module.exports = {
  createConn,
  getFrds,
}
