const express = require("express")
const verifyToken = require("../../middlewares/verifyToken")
const router = express.Router()
const SwapRequest = require("../../models/SwapRequest")
const User = require("../../models/User")

router.get("/", (req, res) => {
  res.json({ message: "Hello there" })
})

router.post("/create", verifyToken, async (req, res) => {
  const { bookRequestedId, bookOfferedId, recipientId } = req.body
  console.log(req.body)
  const userId = req.userId
  const swapRequest = new SwapRequest({
    sender: userId,
    recipient: recipientId,
    bookRequested: bookRequestedId,
    bookOffered: bookOfferedId,
  })
  try {
    const swapRequestSaved = await swapRequest.save()
    const user = await User.findByIdAndUpdate(userId, {
      $push: { swapRequests: swapRequestSaved._id },
    })
    const recipient = await User.findByIdAndUpdate(recipientId, {
      $push: { swapNotifications: swapRequestSaved._id },
    })

    res.status(200).json({ message: "Swap request created" })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.post("/accept", verifyToken, async (req, res) => {
  const { swapRequestId } = req.body
  const swapRequest = await SwapRequest.findById(swapRequestId)
  //update the swap request
  swapRequest.status = "accepted"
  await swapRequest.save()

  //update the swaps of the users and the contacts
  const sender = await User.findById(swapRequest.sender)
  if (!sender.swaps.includes(swapRequestId)) {
    sender.swaps.push(swapRequestId)
    await sender.save()
  }
  const recipient = await User.findById(swapRequest.recipient)
  if (!recipient.swaps.includes(swapRequestId)) {
    recipient.swaps.push(swapRequestId)
    await recipient.save()
  }

  if (!sender.contacts.includes(recipient._id)) {
    sender.contacts.push(recipient._id)
    await sender.save()
  }
  if (!recipient.contacts.includes(sender._id)) {
    recipient.contacts.push(sender._id)
    await recipient.save()
  }

  res.status(200).json({ message: "Swap request accepted" })
})

router.post("/decline", verifyToken, async (req, res) => {
  const { swapRequestId } = req.body
  const swapRequest = await SwapRequest.findById(swapRequestId)
  //update the swap request
  swapRequest.status = "declined"
  await swapRequest.save()
  res.status(200).json({ message: "Swap request declined" })
})

router.post("/cancel", verifyToken, async (req, res) => {
  const { swapRequestId } = req.body
  const swapRequest = await SwapRequest.findById(swapRequestId)
  //update the swap request
  swapRequest.status = "cancelled"
  await swapRequest.save()
  res.status(200).json({ message: "Swap request cancelled" })
})

module.exports = router
