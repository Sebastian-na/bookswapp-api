const express = require("express")
const router = express.Router()
const User = require("../../models/User")
const verifyToken = require("../../middlewares/verifyToken")
const upload = require("../../middlewares/upload")
const { mongoClient } = require("../../db/connection")
const GridFsBucket = require("mongodb").GridFSBucket
const { FILES_URL } = require("../../constants/index")

const fieldsAllowedToUpdate = ["name", "bio", "profilePic"]

// @route   GET api/user/profile
router.get("/", verifyToken, async (req, res) => {
  //get user from database with the id in req.userId without his password

  const user = await User.findById(req.userId, "-password")
  await mongoClient.connect()
  const images = mongoClient.db().collection("images.files")
  const profilePic = await images.findOne({ _id: user.profilePic })
  res
    .status(200)
    .json({ ...user._doc, profilePic: FILES_URL + profilePic.filename })
})

// @route   PUT api/user/profile
router.put("/", verifyToken, upload.single("image"), async (req, res) => {
  const photo = req.file

  // get keys from req.body
  const keys = Object.keys(req.body)
  // get user from database with the id in req.userId
  const user = await User.findById(req.userId)
  if (photo) {
    user.profilePic = photo.id
  }

  if (!user) return res.status(404).json({ message: "User not found" })

  // loop through keys
  for (let i = 0; i < keys.length; i++) {
    if (!fieldsAllowedToUpdate.includes(keys[i])) {
      continue
    }
    // set user[key] to req.body[key]
    user[keys[i]] = req.body[keys[i]]
  }

  if (keys.includes("genres")) {
    //push new genres to user.genres
    user.genres = user.genres.concat(req.body.genres)
  }

  if (keys.includes("tags")) {
    //push new tags to user.tags
    user.tags = user.tags.concat(req.body.tags)
  }

  // save user
  await user.save()
  res.status(200).json(user)
})

module.exports = router
