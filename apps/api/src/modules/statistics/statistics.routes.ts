import { Router } from 'express'

import {
  authMiddleware,
} from '../../middleware/auth.middleware.js'

import {
  getMyStatisticsController,
} from './statistics.controller.js'

const statisticsRouter = Router()

statisticsRouter.get(
  '/me',
  authMiddleware,
  getMyStatisticsController,
)

export default statisticsRouter