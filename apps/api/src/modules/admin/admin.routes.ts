import { Router } from 'express'

import { authMiddleware } from '../../middleware/auth.middleware.js'
import { adminMiddleware } from '../../middleware/admin.middleware.js'

import {
  activateFileController,
  blockUserController,
  getAdminFileController,
  getAdminStatsController,
  getUserController,
  listAdminFilesController,
  listUsersController,
  restrictFileController,
  unblockUserController,
} from './admin.controller.js'

const adminRouter = Router()

adminRouter.use(
  authMiddleware,
  adminMiddleware,
)

adminRouter.get(
  '/stats',
  getAdminStatsController,
)

adminRouter.get(
  '/users',
  listUsersController,
)

adminRouter.get(
  '/users/:id',
  getUserController,
)

adminRouter.patch(
  '/users/:id/block',
  blockUserController,
)

adminRouter.patch(
  '/users/:id/unblock',
  unblockUserController,
)

adminRouter.get(
  '/files',
  listAdminFilesController,
)

adminRouter.get(
  '/files/:id',
  getAdminFileController,
)

adminRouter.patch(
  '/files/:id/restrict',
  restrictFileController,
)

adminRouter.patch(
  '/files/:id/activate',
  activateFileController,
)

export default adminRouter