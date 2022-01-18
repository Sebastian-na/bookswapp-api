const multer = require("multer")
const { GridFsStorage } = require("multer-gridfs-storage")
const { uri } = require("../db/connection")

const storage = new GridFsStorage({
  url: uri,
  options: { useNewUrlParser: true, useUnifiedTopology: true },
  file: (req, file) => {
    const match = ["image/png", "image/jpeg", "image/*"]

    if (match.indexOf(file.mimetype) === -1) {
      const filename = `${Date.now()}-${file.originalname}`
      return filename
    }
    return {
      bucketName: "images",
      filename: `${Date.now()}-${file.originalname}`,
    }
  },
})

const upload = multer({ storage })

module.exports = upload
