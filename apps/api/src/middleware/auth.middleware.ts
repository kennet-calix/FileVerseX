import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: {
    id_usuario: number
    id_rol: number
    email: string
  }
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const authorization = req.headers.authorization

  if (!authorization) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Token de autenticación requerido',
      },
    })
  }

  const [type, token] = authorization.split(' ')

  if (type !== 'Bearer' || !token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN_FORMAT',
        message: 'Formato de token inválido',
      },
    })
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'JWT_SECRET_NOT_CONFIGURED',
        message: 'Error de configuración del servidor',
      },
    })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)

    if (
      typeof decoded === 'string' ||
      typeof decoded.sub !== 'number'
    ) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido',
        },
      })
    }

    req.user = {
      id_usuario: decoded.sub,
      id_rol: Number(decoded.role),
      email: String(decoded.email),
    }

    next()
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_OR_EXPIRED_TOKEN',
        message: 'Token inválido o expirado',
      },
    })
  }
}