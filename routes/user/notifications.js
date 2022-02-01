const express = require("express")
const verifyToken = require("../../middlewares/verifyToken")
const router = express.Router()
const SwapRequest = require("../../models/SwapRequest")
const User = require("../../models/User")
const Book = require("../../models/Book")
const { FILES_URL } = require("../../constants/index")
const { mongoClient } = require("../../db/connection")

router.get("/", verifyToken, async (req, res) => {
  await mongoClient.connect()
  const images = mongoClient.db().collection("images.files")
  const user = await User.findById(req.userId)
  //return the notifications of the user
  let notificationsIds = user.swapNotifications
  let notifications = await Promise.all(
    notificationsIds.map(async (notification) => {
      return await SwapRequest.findById(notification)
    })
  )
  let filteredNotifications = notifications.filter(
    (notification) => notification.status === "pending"
  )
  console.log(filteredNotifications)
  const notificationsData = await Promise.all(
    filteredNotifications.map(async (notification) => {
      const bookRequested = await Book.findById(notification.bookRequested)
      const bookOffered = await Book.findById(notification.bookOffered)
      const recipient = await User.findById(notification.recipient, "-password")
      const sender = await User.findById(notification.sender, "-password")
      const senderProfilePic = await images.findOne({ _id: sender.profilePic })

      return {
        _id: notification._id,
        bookRequested,
        bookOffered,
        recipient,
        status: notification.status,
        sender: {
          ...sender._doc,
          profilePic: FILES_URL + senderProfilePic.filename,
        },
      }
    })
  )
  res.status(200).json({ notifications: notificationsData })
})

module.exports = router
