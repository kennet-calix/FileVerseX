import type { Response } from 'express'

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'

import {
  obtenerEstadisticasUsuario,
} from './statistics.service.js'

export async function getMyStatisticsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message:
            'Usuario no autenticado',
        },
      })
    }

    const statistics =
      await obtenerEstadisticasUsuario(
        req.user.id_usuario,
      )

    return res.status(200).json({
      data: statistics,
    })
  } catch (error) {
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible obtener las estadísticas',
      },
    })
  }
}