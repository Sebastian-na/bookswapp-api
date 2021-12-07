const express = require("express")
const books = require("./books/books")

const router = express.Router()
router.use("/books", books)

module.exports = router
