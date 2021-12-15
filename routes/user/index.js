const express = require("express")
const books = require("./books")
const profile = require("./profile")
const feed = require("./feed")

const router = express.Router()
router.use("/books", books)
router.use("/profile", profile)
router.use("/feed", feed)

module.exports = router
