const express = require("express")
const router = express.Router()
router.use("/books", require("./books"))
router.use("/profile", require("./profile"))
router.use("/feed", require("./feed"))
router.use("/notifications", require("./notifications"))
router.use("/requests", require("./requests"))
router.use("/contacts", require("./contacts"))

module.exports = router
