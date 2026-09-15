import {
  Router,
} from 'express'

import {
  authMiddleware,
} from '../../middleware/auth.middleware.js'

import {
  getTraceabilityReportController,
} from './report.controller.js'

const reportRouter =
  Router()

reportRouter.get(
  '/traceability',
  authMiddleware,
  getTraceabilityReportController,
)

export default reportRouter