import {
  Router,
} from 'express'

import {
  authMiddleware,
} from '../../middleware/auth.middleware.js'

import {
  getAvailableUsersController,
  getMeController,
  updateMyProfileController,
} from './user.controller.js'

const userRouter =
  Router()

userRouter.get(
  '/',
  authMiddleware,
  getAvailableUsersController,
)

userRouter.get(
  '/me',
  authMiddleware,
  getMeController,
)

userRouter.put(
  '/me',
  authMiddleware,
  updateMyProfileController,
)

export default userRouter