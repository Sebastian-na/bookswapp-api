const express = require("express")
const router = express.Router()
const User = require("../../../models/User")
const verifyToken = require("../../../middlewares/verifyToken")

const fieldsAllowedToUpdate = ["name", "bio", "profilePic"]

// @route   GET api/user/profile
router.get("/", verifyToken, async (req, res) => {
  //get user from database with the id in req.userId without his password
  const user = await User.findById(req.userId, "-password")
  res.status(200).json(user)
})

// @route   PUT api/user/profile
router.put("/", verifyToken, async (req, res) => {
  // get keys from req.body
  const keys = Object.keys(req.body)
  // get user from database with the id in req.userId
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ message: "User not found" })

  // loop through keys
  for (let i = 0; i < keys.length; i++) {
    if (!fieldsAllowedToUpdate.includes(keys[i])) {
      continue
    }
    // set user[key] to req.body[key]
    user[keys[i]] = req.body[keys[i]]
  }

  // save user
  await user.save()
  res.status(200).json(user)
})

module.exports = router
