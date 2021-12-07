const jwt = require("jsonwebtoken")

module.exports = function verifyToken(req, res, next) {
  console.log("verifyToken")
  const bearerHeader = req.headers["authorization"]
  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ")
    const bearerToken = bearer[1]
    const { id } = jwt.verify(bearerToken, process.env.JWT_SECRET)
    req.accessToken = bearerToken
    req.userId = id
    next()
  } else {
    res.sendStatus(403)
  }
}
