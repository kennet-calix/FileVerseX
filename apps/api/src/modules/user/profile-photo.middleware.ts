import fs from 'fs'
import path from 'path'
import multer from 'multer'

const profilePhotosDirectory =
  path.resolve(
    process.cwd(),
    'uploads',
    'profiles',
  )

if (
  !fs.existsSync(
    profilePhotosDirectory,
  )
) {
  fs.mkdirSync(
    profilePhotosDirectory,
    {
      recursive: true,
    },
  )
}

const storage =
  multer.diskStorage({
    destination: (
      _req,
      _file,
      callback,
    ) => {
      callback(
        null,
        profilePhotosDirectory,
      )
    },

    filename: (
      req,
      file,
      callback,
    ) => {
      const extension =
        path.extname(
          file.originalname,
        ).toLowerCase()

      const uniqueName =
        `profile-${Date.now()}-${Math.round(
          Math.random() *
            1_000_000,
        )}${extension}`

      callback(
        null,
        uniqueName,
      )
    },
  })

const allowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

export const uploadProfilePhoto =
  multer({
    storage,

    limits: {
      fileSize:
        5 * 1024 * 1024,
    },

    fileFilter: (
      _req,
      file,
      callback,
    ) => {
      if (
        !allowedMimeTypes.includes(
          file.mimetype,
        )
      ) {
        callback(
          new Error(
            'INVALID_PROFILE_PHOTO_TYPE',
          ),
        )

        return
      }

      callback(
        null,
        true,
      )
    },
  })