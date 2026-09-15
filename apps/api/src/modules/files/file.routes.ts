import { Router } from 'express'

import { authMiddleware } from '../../middleware/auth.middleware.js'

import {
  deleteFileController,
  downloadFileController,
  listFilesController,
  previewFileController,
  uploadFileController,
} from './file.controller.js'

import { uploadFile } from './file.upload.js'

const fileRouter = Router()

fileRouter.get(
  '/',
  authMiddleware,
  listFilesController,
)

fileRouter.post(
  '/upload',
  authMiddleware,
  uploadFile.single('file'),
  uploadFileController,
)

fileRouter.get(
  '/:id/preview',
  authMiddleware,
  previewFileController,
)

fileRouter.get(
  '/:id/download',
  authMiddleware,
  downloadFileController,
)

fileRouter.delete(
  '/:id',
  authMiddleware,
  deleteFileController,
)

export default fileRouter