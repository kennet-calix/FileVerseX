import { Router } from 'express'

import { authMiddleware } from '../../middleware/auth.middleware.js'

import {
  createCommentController,
  createPublicationController,
  deactivatePublicationController,
  listCommentsController,
  listPublicationsController,
  listRecipientsController,
  toggleLikeController,
  updatePublicationController,
} from './publication.controller.js'

const publicationRouter = Router()

publicationRouter.get(
  '/',
  authMiddleware,
  listPublicationsController,
)

publicationRouter.post(
  '/',
  authMiddleware,
  createPublicationController,
)

publicationRouter.put(
  '/:id',
  authMiddleware,
  updatePublicationController,
)

publicationRouter.delete(
  '/:id',
  authMiddleware,
  deactivatePublicationController,
)

publicationRouter.post(
  '/:id/like',
  authMiddleware,
  toggleLikeController,
)

publicationRouter.get(
  '/:id/comments',
  authMiddleware,
  listCommentsController,
)

publicationRouter.post(
  '/:id/comments',
  authMiddleware,
  createCommentController,
)

publicationRouter.get(
  '/:id/recipients',
  authMiddleware,
  listRecipientsController,
)

export default publicationRouter