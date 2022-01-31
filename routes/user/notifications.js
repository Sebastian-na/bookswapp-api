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
  let notifications = user.swapNotifications
  notifications = await Promise.all(
    notifications.filter(async (notification) => {
      const swapRequest = await SwapRequest.findById(notification)
      return swapRequest.status === "pending"
    })
  )
  const notificationsData = await Promise.all(
    notifications.map(async (notification) => {
      const swapRequest = await SwapRequest.findById(notification)
      const bookRequested = await Book.findById(swapRequest.bookRequested)
      const bookOffered = await Book.findById(swapRequest.bookOffered)
      const recipient = await User.findById(swapRequest.recipient, "-password")
      const sender = await User.findById(swapRequest.sender, "-password")
      const senderProfilePic = await images.findOne({ _id: sender.profilePic })

      return {
        _id: swapRequest._id,
        bookRequested,
        bookOffered,
        recipient,
        status: swapRequest.status,
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
