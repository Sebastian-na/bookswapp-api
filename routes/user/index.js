const express = require("express")
const books = require("./books")
const profile = require("./profile")
const feed = require("./feed")
const notifications = require("./notifications")
const requests = require("./requests")

const router = express.Router()
router.use("/books", books)
router.use("/profile", profile)
router.use("/feed", feed)
router.use("/notifications", notifications)
router.use("/requests", requests)
router.use("/contacts", require("./contacts"))

module.exports = router
