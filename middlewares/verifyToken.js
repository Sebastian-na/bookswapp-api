const jwt = require("jsonwebtoken")
const User = require("../models/User")

module.exports = async function verifyToken(req, res, next) {
  console.log("verifyToken")
  const bearerHeader = req.headers["authorization"]
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ")
    const bearerToken = bearer[1]
    console.log(bearerToken)
    try {
      const { id } = jwt.verify(bearerToken, process.env.JWT_SECRET)
      req.accessToken = bearerToken
      req.userId = id
      const user = await User.findById(id)
      if (!user) {
        res.status(400).json({ message: "User not found" })
        return
      }

      next()
    } catch (err) {
      console.log("Bad signature")
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(403)
  }
}
