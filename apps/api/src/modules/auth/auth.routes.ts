import { Router } from 'express'

import {
  loginController,
  registerController,
} from './auth.controller.js'

import {
  forgotPasswordController,
  resetPasswordController,
} from './password-reset.controller.js'

const authRouter = Router()

authRouter.post(
  '/register',
  registerController,
)

authRouter.post(
  '/login',
  loginController,
)

authRouter.post(
  '/forgot-password',
  forgotPasswordController,
)

authRouter.post(
  '/reset-password',
  resetPasswordController,
)

export default authRouter