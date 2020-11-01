const User = require('./user')
const Msg = require('./message')
const CODE = require('../common.json').code

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
const subscribe = async (requestorEmail, targetEmail) => {
  try {
    let requestor = await User.findOne({ email: requestorEmail }).exec()
    if (!requestor)
      requestor = new User({
        email: emailHost,
        subscriptionList: [targetEmail],
      })
    else {
      if (requestor.blockList.indexOf(targetEmail) > -1)
        return {
          code: CODE.LOGICAL_FAILURE,
          message: 'Fail to subscribe: You blocked this email address.',
        }
      else requestor.subscriptionList.push(targetEmail)
    }
    requestor.save()
    return {
      code: CODE.SUCCESS,
    }
  } catch (err) {
    return {
      error: err,
      code: CODE.DATA_QUERY_ERROR,
    }
  }
}
const block = async (requestorEmail, targetEmail) => {
  // ● If they are connected as friends
  //    then “andy” will no longer receive notifications from “john”
  // ● If they are not connected as friends, then no new friends
  //    connection can be added
  try {
    let requestor = await User.findOne({ email: requestorEmail }).exec()
    if (!requestor)
      requestor = new User({
        email: emailHost,
        blockList: [targetEmail],
      })
    else {
      requestor.blockListList.push(targetEmail)
    }
    requestor.save()
    return {
      code: CODE.SUCCESS,
    }
  } catch (err) {
    return {
      error: err,
      code: CODE.DATA_QUERY_ERROR,
    }
  }
}
const getUpdatesReceiveList = async (userEmail) => {
  // Eligibility for receiving updates from i.e. “​alex@example.com​”:
  // ● Has not blocked updates from “​alex@example.com”​ ,
  //and At least one of the following
  //      ● Has a friend connection with “​alex@example.com”​
  //      ● Has subscribed to updates from “​alex@example.com​”
  try {
    let receivingList = []
    const blockedList = await User.find({
      blockList: { $elemMatch: { $in: userEmail } },
    }).exec()
    const friendingList = await User.find({
      friendsList: { $elemMatch: { $in: userEmail } },
    }).exec()
    const subscribingList = await User.find({
      subscriptionList: { $elemMatch: { $in: userEmail } },
    }).exec()
    for (f of friendingList) {
      let friendEmail = f.email
      if (receivingList.indexOf(friendEmail) == -1) {
        receivingList.push(friendEmail)
      }
    }
    for (s of subscribingList) {
      let subEmail = s.email
      if (receivingList.indexOf(subEmail) == -1) {
        receivingList.push(subEmail)
      }
    }
    for (b of blockedList) {
      let blockedEmail = b.email
      let id = receivingList.indexOf(blockedEmail)
      if (id > -1) {
        receivingList.splice(id, 1)
      }
    }
    return {
      code: CODE.SUCCESS,
      receivingList: receivingList,
    }
  } catch (err) {
    return {
      error: err,
      code: CODE.DATA_QUERY_ERROR,
    }
  }
}
const savePostUpdateMsg = async (sendFrom, sendTo, postMessage) => {
  try {
    const mentionedList = recognizeEmail(postMessage)
    const postUpdate = new Msg({
      sendFrom: sendFrom,
      sendTo: sendTo,
      message: postMessage,
      mentionedList: mentionedList,
    })
    postUpdate.save()
    return {
      code: CODE.SUCCESS,
    }
  } catch (err) {
    return {
      error: err,
      code: CODE.DATA_QUERY_ERROR,
    }
  }
}

const recognizeEmail = (inputText) => {
  let regEmail = /@\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/g
  const mentionedListWAt = inputText.match(regEmail)
  const mentionedList = mentionedListWAt.map((x) => x.replace(/^@/, ''))
  return mentionedList
}

module.exports = {
  createConn,
  getFrds,
  subscribe,
  block,
  getUpdatesReceiveList,
  savePostUpdateMsg,
  recognizeEmail,
}
