import fs from 'node:fs'
import path from 'node:path'
import multer from 'multer'

const uploadDirectory = path.resolve('uploads')

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  })
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadDirectory)
  },

  filename: (_req, file, callback) => {
    const uniqueName =
      `${Date.now()}-${Math.round(Math.random() * 1e9)}`

    const extension = path.extname(file.originalname)

    callback(null, `${uniqueName}${extension}`)
  },
})

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',

  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',

  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export const uploadFile = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      callback(new Error('FILE_TYPE_NOT_ALLOWED'))
      return
    }

    callback(null, true)
  },
})