const express = require("express")
const auth = require("./routes/auth")
const user = require("./routes/user")

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/auth", auth)
app.use("/user", user)

app.listen(3000)
