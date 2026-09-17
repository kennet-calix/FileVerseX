import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import {
  fileURLToPath,
} from 'url'

import authRouter from './modules/auth/auth.routes.js'
import userRouter from './modules/user/user.routes.js'
import fileRouter from './modules/files/file.routes.js'
import collectionRouter from './modules/collections/collection.routes.js'
import adminRouter from './modules/admin/admin.routes.js'
import publicationRouter from './modules/publications/publication.routes.js'
import statisticsRouter from './modules/statistics/statistics.routes.js'
import reportRouter from './modules/reports/report.routes.js'

import {
  errorMiddleware,
} from './middleware/error.middleware.js'

const app = express()

/*
  ========================================
  DIRECTORIO DEL BACKEND
  ========================================

  Este archivo está en:
  apps/api/src/app.ts

  Subimos un nivel desde src
  para llegar a:

  apps/api
*/
const __filename =
  fileURLToPath(
    import.meta.url,
  )

const __dirname =
  path.dirname(
    __filename,
  )

const apiDirectory =
  path.resolve(
    __dirname,
    '..',
  )

/*
  Carpeta donde se guardan
  las fotos de perfil:

  apps/api/uploads/profiles
*/
const profilePhotosDirectory =
  path.join(
    apiDirectory,
    'uploads',
    'profiles',
  )

/*
  ========================================
  SEGURIDAD
  ========================================

  Permitimos que recursos como las
  fotografías puedan ser utilizados
  desde el frontend:

  http://localhost:5173

  aunque el backend esté en:

  http://localhost:3000
*/
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  }),
)

/*
  ========================================
  CORS
  ========================================
*/
app.use(
  cors({
    origin:
      'http://localhost:5173',

    credentials: true,
  }),
)

/*
  ========================================
  JSON
  ========================================
*/
app.use(
  express.json(),
)

/*
  ========================================
  FOTOS DE PERFIL
  ========================================

  Las fotografías quedan disponibles
  públicamente mediante:

  http://localhost:3000/uploads/profiles/archivo.jpg
*/
app.use(
  '/uploads/profiles',

  express.static(
    profilePhotosDirectory,
    {
      setHeaders: (
        response,
      ) => {
        /*
          Permite que el navegador
          incruste la fotografía desde
          localhost:5173.
        */
        response.setHeader(
          'Cross-Origin-Resource-Policy',
          'cross-origin',
        )

        response.setHeader(
          'Access-Control-Allow-Origin',
          'http://localhost:5173',
        )
      },
    },
  ),
)

/*
  ========================================
  RUTAS DE LA API
  ========================================
*/

app.use(
  '/api/v1/auth',
  authRouter,
)

app.use(
  '/api/v1/users',
  userRouter,
)

app.use(
  '/api/v1/files',
  fileRouter,
)

app.use(
  '/api/v1/collections',
  collectionRouter,
)

app.use(
  '/api/v1/admin',
  adminRouter,
)

app.use(
  '/api/v1/publications',
  publicationRouter,
)

app.use(
  '/api/v1/statistics',
  statisticsRouter,
)

app.use(
  '/api/v1/reports',
  reportRouter,
)

/*
  ========================================
  HEALTH CHECK
  ========================================
*/
app.get(
  '/api/v1/health',
  (_req, res) => {
    res.status(200).json({
      success: true,
      message:
        'FileVerseX API funcionando correctamente',
    })
  },
)

/*
  ========================================
  MANEJO GLOBAL DE ERRORES
  ========================================
*/
app.use(
  errorMiddleware,
)

export default app