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
  updateMyProfilePhotoController,
} from './user.controller.js'

import {
  uploadProfilePhoto,
} from './profile-photo.middleware.js'

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

userRouter.put(
  '/me/photo',
  authMiddleware,
  uploadProfilePhoto.single(
    'photo',
  ),
  updateMyProfilePhotoController,
)

export default userRouter