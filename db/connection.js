const moongose = require("mongoose")
require("dotenv").config()
const MongoClient = require("mongodb").MongoClient

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ah3vy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

moongose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err))

const mongoClient = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

module.exports = { uri, mongoClient }
