const express = require('express')
const { ConnectionBase } = require('mongoose')
const friendRouter = express.Router()
const User = require('../models/user')
const util = require('../models/util')
const validator = require('../validator')

//1. POST create a new friend connection
friendRouter.route('/addNewConn').post(async (req, res) => {
  const result = await util.createConn(req.body)
  // console.log(result)
  if (result.code == 'SUCCESS') return res.status(200).json({ success: true })
  else if (result.code == 'LOGICAL_FAILURE') return res.status(400).json(result)
  else return res.status(500).json(result)
})

//2. GET  retrieve the friends’ list for an email address.
friendRouter.route('/getFriends/:email').get(async (req, res) => {
  if (!validator.ValidateEmail(req.params.email))
    return res
      .status(400)
      .json({ error: 'TypeError', message: 'Invalid email address' })
  const result = await util.getFrds(req.params.email)
  if (result.code == 'SUCCESS') return res.status(200).send(result.friendsList)
  else return res.status(500).json(result)
})

//3. GET  retrieve the common friends’ list between two email addresses.
friendRouter
  .route('/getCommonFriends/:emailOfUser1/:emailOfUser2')
  .get(async (req, res) => {
    if (
      !validator.ValidateEmail(req.params.emailOfUser1) ||
      !validator.ValidateEmail(req.params.emailOfUser2)
    )
      return res
        .status(400)
        .json({ error: 'TypeError', message: 'Invalid email address' })
    let query = await util.getFrds(req.params.emailOfUser1)
    let [friendsOfUser1, friendsOfUser2] = [[], []]
    if (query.code == 'SUCCESS') friendsOfUser1 = query.friendsList
    query = await util.getFrds(req.params.emailOfUser2)
    if (query.code == 'SUCCESS') friendsOfUser2 = query.friendsList
    let commonFriends = []
    // console.log(friendsOfUser2)
    if (friendsOfUser1 == false || friendsOfUser2 == false) {
      return res.status(200).send(commonFriends)
    }
    for (f of friendsOfUser1) {
      if (friendsOfUser2.indexOf(f) > -1) {
        commonFriends.push(f)
      }
    }
    return res.status(200).send(commonFriends)
  })

//4. POST subscribe to updates from an email address.
friendRouter.route('/subscribe').post(async (req, res) => {
  if (
    !validator.ValidateEmail(req.body.requestor) ||
    !validator.ValidateEmail(req.body.target)
  )
    return res
      .status(400)
      .json({ error: 'TypeError', message: 'Invalid email address' })
  const result = await util.subscribe(req.body.requestor, req.body.target)
  // console.log(result)
  if (result.code == 'SUCCESS') return res.status(200).json({ success: true })
  else if (result.code == 'LOGICAL_FAILURE') return res.status(400).json(result)
  else return res.status(500).json(result)
})

//5. POST  block updates from an email address
friendRouter.route('/subscribe').post(async (req, res) => {
  if (
    !validator.ValidateEmail(req.body.requestor) ||
    !validator.ValidateEmail(req.body.target)
  )
    return res
      .status(400)
      .json({ error: 'TypeError', message: 'Invalid email address' })
  const result = await util.block(req.body.requestor, req.body.target)
  console.log(result)
  if (result.code == 'SUCCESS') return res.status(200).json({ success: true })
  else if (result.code == 'LOGICAL_FAILURE') return res.status(400).json(result)
  else return res.status(500).json(result)
})

//6. GET retrieve all email addresses that can receive updates from an email address.
friendRouter.route('/getUpdatesReceiveList/:email').get(async (req, res) => {
  if (!validator.ValidateEmail(req.params.email))
    return res
      .status(400)
      .json({ error: 'TypeError', message: 'Invalid email address' })
  const result = await util.getUpdatesReceiveList(req.params.email)
  console.log(result)
  if (result.code == 'SUCCESS')
    return res.status(200).json(result.receivingList)
  else return res.status(500).json(result)
})

//7. As a user, I need a backend scheduler to send out updates via email server between the friend’s connection.

module.exports = friendRouter
