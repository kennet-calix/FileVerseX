import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRouter from './modules/auth/auth.routes.js'
import userRouter from './modules/user/user.routes.js'
import fileRouter from './modules/files/file.routes.js'
import collectionRouter from './modules/collections/collection.routes.js'
import adminRouter from './modules/admin/admin.routes.js'
import publicationRouter from './modules/publications/publication.routes.js'
import statisticsRouter from './modules/statistics/statistics.routes.js'

import { errorMiddleware } from './middleware/error.middleware.js'
import reportRouter from './modules/reports/report.routes.js'
const app = express()

app.use(helmet())

app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)

app.use(express.json())

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/users', userRouter)
app.use('/api/v1/files', fileRouter)
app.use('/api/v1/collections', collectionRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/publications', publicationRouter)
app.use('/api/v1/statistics', statisticsRouter)
app.use('/api/v1/reports', reportRouter)
app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'FileVerseX API funcionando correctamente',
  })
})

app.use(errorMiddleware)

export default app