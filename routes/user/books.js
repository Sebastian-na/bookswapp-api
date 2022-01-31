const express = require("express")
const verifyToken = require("../../middlewares/verifyToken")
const upload = require("../../middlewares/upload")
const User = require("../../models/User")
const Book = require("../../models/Book")
const MongoClient = require("mongodb").MongoClient
const GridFsBucket = require("mongodb").GridFSBucket
const dbConfig = require("../../db/connection")
const { FILES_URL } = require("../../constants/index")

const mongoClient = new MongoClient(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ah3vy.mongodb.net`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

const router = express.Router()

router.post(
  "/addAvailable",
  verifyToken,
  upload.array("image"),
  async (req, res) => {
    const { title, author, genre, tags, description } = req.body
    console.log(req.body)
    const photos = req.files.map((file) => file.id)

    const book = new Book({
      owner: req.userId,
      title,
      author,
      genre,
      tags,
      description,
      photos,
    })

    try {
      const bookSaved = await book.save()
      const user = await User.findByIdAndUpdate(req.userId, {
        $push: { availableBooks: bookSaved._id },
      })
      res.status(200).json({ message: "Book added" })
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }
)

router.post(
  "/addWanted",
  verifyToken,
  upload.array("image"),
  async (req, res) => {
    const { title, author, genre, tags, description } = req.body

    const photos = req.files.map((file) => file.id)

    const book = new Book({
      title,
      author,
      genre,
      tags,
      description,
      photos,
    })

    try {
      const bookSaved = await book.save()
      const user = await User.findByIdAndUpdate(req.userId, {
        $push: { wantedBooks: bookSaved._id },
      })
      res.status(200).json({ message: "Book added" })
    } catch (err) {
      res.status(500).json({ message: err })
    }
  }
)

router.get("/available", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const books = await Book.find({ _id: { $in: user.availableBooks } }).lean()
    await mongoClient.connect()
    const db = mongoClient.db(dbConfig.dbName)
    const images = db.collection("images.files")
    const booksWithUrlOfImages = await Promise.all(
      books.map(async (book) => {
        const photosUrl = await Promise.all(
          book.photos.map(async (photo) => {
            const image = await images.findOne({ _id: photo })
            return FILES_URL + image.filename
          })
        )
        return { ...book, photos: photosUrl }
      })
    )
    res.status(200).json({ books: booksWithUrlOfImages })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.get("/wanted", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const books = await Book.find({ _id: { $in: user.wantedBooks } }).lean()
    await mongoClient.connect()
    const db = mongoClient.db(dbConfig.dbName)
    const images = db.collection("images.files")
    const booksWithUrlOfImages = await Promise.all(
      books.map(async (book) => {
        const photosUrl = await Promise.all(
          book.photos.map(async (photo) => {
            const image = await images.findOne({ _id: photo })
            return FILES_URL + image.filename
          })
        )
        return { ...book, photos: photosUrl }
      })
    )
    res.status(200).json({ books: booksWithUrlOfImages })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.get("/files/:name/", async (req, res) => {
  try {
    await mongoClient.connect()
    const db = mongoClient.db(dbConfig.dbName)
    const bucket = new GridFsBucket(db, {
      bucketName: "images",
    })
    const readStream = bucket.openDownloadStreamByName(req.params.name)
    readStream.on("data", (chunk) => {
      res.status(200).write(chunk)
    })

    readStream.on("error", (err) => {
      res.status(404).send({ message: err })
    })

    readStream.on("end", () => {
      res.end()
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.delete("/deleteAvailable/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, {
      $pull: { availableBooks: req.params.id },
    })
    const book = await Book.findById(req.params.id)
    await mongoClient.connect()
    const db = mongoClient.db(dbConfig.dbName)
    const images = db.collection("images.files")
    const chunks = db.collection("images.chunks")
    const photos = await images.find({ _id: { $in: book.photos } }).toArray()
    await Promise.all(
      photos.map(async (photo) => {
        await chunks.deleteMany({ files_id: photo._id })
        await images.deleteOne({ _id: photo._id })
      })
    )
    await Book.findByIdAndDelete(book._id)
    res.status(200).json({ message: "Book deleted" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

router.delete("/deleteWanted/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, {
      $pull: { wantedBooks: req.params.id },
    })
    const book = await Book.findById(req.params.id)
    await mongoClient.connect()
    const db = mongoClient.db(dbConfig.dbName)
    const images = db.collection("images.files")
    const chunks = db.collection("images.chunks")
    const photos = await images.find({ _id: { $in: book.photos } }).toArray()
    await Promise.all(
      photos.map(async (photo) => {
        await chunks.deleteMany({ files_id: photo._id })
        await images.deleteOne({ _id: photo._id })
      })
    )
    await Book.findByIdAndDelete(book._id)
    res.status(200).json({ message: "Book deleted" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err })
  }
})

// this route should return a list of books based on user query
router.get("/search", verifyToken, async (req, res) => {
  await mongoClient.connect()
  const db = mongoClient.db(dbConfig.dbName)
  const images = db.collection("images.files")
  const { q } = req.query
  const results = await Book.find({
    $text: { $search: q },
    owner: { $ne: null },
  }).lean()
  const cleanedBooks = await Promise.all(
    results.map(async (book) => {
      const photosUrl = await Promise.all(
        book.photos.map(async (photo) => {
          const image = await images.findOne({ _id: photo })
          return FILES_URL + image.filename
        })
      )
      const owner = await User.findById(book.owner)
      if (owner) {
        return { ...book, photos: photosUrl, owner: owner.name }
      } else {
        return { ...book, photos: photosUrl }
      }
    })
  )
  res.json(cleanedBooks)
})

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    await mongoClient.connect()
    const db = mongoClient.db(dbConfig.dbName)
    const images = db.collection("images.files")
    const photosUrl = await Promise.all(
      book.photos.map(async (photo) => {
        const image = await images.findOne({ _id: photo })
        return FILES_URL + image.filename
      })
    )
    const owner = await User.findById(book.owner)
    if (owner) {
      res
        .status(200)
        .json({ book: { ...book, photos: photosUrl, owner: owner.name } })
    } else {
      res.status(200).json({ book: { ...book, photos: photosUrl } })
    }
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

module.exports = router
