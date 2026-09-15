import type {
  NextFunction,
  Response,
} from 'express'

import type { AuthenticatedRequest } from './auth.middleware.js'

export function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const user = req.user

  if (!user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado',
      },
    })
  }

  if (user.id_rol !== 1) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message:
          'No tienes permisos para acceder a esta función',
      },
    })
  }

  next()
}