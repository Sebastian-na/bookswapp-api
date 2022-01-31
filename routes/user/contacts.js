const express = require("express")
const verifyToken = require("../../middlewares/verifyToken")
const router = express.Router()
const User = require("../../models/User")
const { FILES_URL } = require("../../constants/index")
const dbConfig = require("../../db/connection")
const MongoClient = require("mongodb").MongoClient

const mongoClient = new MongoClient(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ah3vy.mongodb.net`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

//get user contacts
router.get("/", verifyToken, async (req, res) => {
  const userId = req.userId
  const user = await User.findById(userId)
  await mongoClient.connect()
  const db = mongoClient.db(dbConfig.dbName)
  const images = db.collection("images.files")
  const contacts = await Promise.all(
    user.contacts.map(async (contact) => {
      const user = await User.findById(contact)
      const profilePic = await user.profilePic
      const profilePicData = await images.findOne({ _id: profilePic })
      return {
        ...user._doc,
        profilePic: FILES_URL + profilePicData.filename,
      }
    })
  )
  res.status(200).json({ contacts })
})

module.exports = router
