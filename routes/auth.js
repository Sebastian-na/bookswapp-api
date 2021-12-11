const express = require("express")
const bcrypt = require("bcrypt")
require("dotenv").config()
const User = require("../models/User.js")
require("../db/connection")
const jwt = require("jsonwebtoken")
const formData = require("form-data")
const Mailgun = require("mailgun.js")
const mailgun = new Mailgun(formData)
const mg = mailgun.client({
  username: process.env.MAILGUN_USER,
  key: process.env.MAILGUN_API_KEY,
  public_key: process.env.MAILGUN_PUBLIC_KEY,
})


const router = express.Router()

router.post("/login", (req, res) => {
  console.log(req.body.email)
  console.log(req.body.password)
  console.log(req.body)
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "User not found" })
      } else {
        bcrypt.compare(req.body.password, user.password).then((result) => {
          if (result) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.status(200).json({
              message: "Login successful",
              token: token,
            })
          } else {
            res.status(401).json({ message: "Wrong password" })
          }
        })
      }
    })
    .catch((err) => {
      res.status(500).json({ message: "Internal server error" })
    })
})

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ message: "Missing fields" })
    }

    const oldUser = await User.findOne({ email })
    if (oldUser) {
      if (oldUser.status === "verified") {
        res.status(400).json({ message: "User already exists" })
      } else {
        res.status(400).json({ message: "Please, verify your email" })
      }
    }

    if (!email.includes("@unal.edu.co")) {
      res.status(400).json({ message: "You need to use your UNAL email" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      name: name,
      email: email.toLowerCase(),
      password: hashedPassword,
    })

    user.save((err) => {
      if (err) res.status(500).send(err)
    })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
    const data = {
      from: `Bookswap <postmaster@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: "Welcome to Bookswap",
      html: `
      <h1>Bienvenido a Bookswap ${name}</h1>
      <p>Verifica tu cuenta haciendo click en el siguiente enlace:</p>
      <a href="${process.env.CLIENT_URL}/auth/verify?accessToken=${token}">Verificar cuenta</a>
      `,
    }
    mg.messages().send(data, (error, body) => {
      if (error) {
        console.log(error)
      }
    })

    res.status(201).json({ message: "User created, please verify your email" })
  } catch {
    res.status(500)
  }
})

router.get("/verify", async (req, res) => {
  try {
    const { accessToken } = req.query
    const { id } = jwt.verify(accessToken, process.env.JWT_SECRET)
    const user = await User.findById(id)
    if (!user) {
      res.status(400).send("User not found")
    }
    user.status = "verified"
    user.save((err) => {
      if (err) res.status(500).send(err)
    })
    res.status(200).send("User verified")
  } catch {
    res.status(500)
  }
})

module.exports = router
