import { Router } from 'express'

import { authMiddleware } from '../../middleware/auth.middleware.js'

import {
  addFileToCollectionController,
  createCollectionController,
  deleteCollectionController,
  listCollectionFilesController,
  listCollectionsController,
  removeFileFromCollectionController,
  updateCollectionController,
} from './collection.controller.js'

const collectionRouter = Router()

collectionRouter.get(
  '/',
  authMiddleware,
  listCollectionsController,
)

collectionRouter.post(
  '/',
  authMiddleware,
  createCollectionController,
)

collectionRouter.put(
  '/:id',
  authMiddleware,
  updateCollectionController,
)

collectionRouter.delete(
  '/:id',
  authMiddleware,
  deleteCollectionController,
)

collectionRouter.get(
  '/:id/files',
  authMiddleware,
  listCollectionFilesController,
)

collectionRouter.post(
  '/:id/files/:fileId',
  authMiddleware,
  addFileToCollectionController,
)

collectionRouter.delete(
  '/:id/files/:fileId',
  authMiddleware,
  removeFileFromCollectionController,
)

export default collectionRouter