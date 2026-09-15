import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import multer from 'multer'

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message:
            'El archivo supera el tamaño máximo permitido de 10 MB',
        },
      })
    }

    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message:
          'No fue posible procesar el archivo',
      },
    })
  }

  if (
    error instanceof Error &&
    error.message === 'FILE_TYPE_NOT_ALLOWED'
  ) {
    return res.status(415).json({
      success: false,
      error: {
        code: 'FILE_TYPE_NOT_ALLOWED',
        message:
          'El tipo de archivo seleccionado no está permitido',
      },
    })
  }

  console.error(error)

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        'Ocurrió un error interno en el servidor',
    },
  })
}