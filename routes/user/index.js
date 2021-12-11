const express = require("express")
const books = require("./books/books")
const profile = require("./profile/profile")

const router = express.Router()
router.use("/books", books)
router.use("/profile", profile)

module.exports = router
