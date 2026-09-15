import type { Response } from 'express'

import type {
  AuthenticatedRequest,
} from '../../middleware/auth.middleware.js'

import {
  obtenerReporteTrazabilidad,
} from './report.service.js'

export async function getTraceabilityReportController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,

      error: {
        code:
          'UNAUTHORIZED',

        message:
          'Usuario no autenticado',
      },
    })
  }

  try {
    const report =
      await obtenerReporteTrazabilidad(
        req.user.id_usuario,
      )

    return res.status(200).json({
      success: true,

      data:
        report,
    })
  } catch (error) {
    console.error(
      error,
    )

    return res.status(500).json({
      success: false,

      error: {
        code:
          'INTERNAL_SERVER_ERROR',

        message:
          error instanceof Error
            ? error.message
            : 'No fue posible obtener el reporte de trazabilidad',
      },
    })
  }
}