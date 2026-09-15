import path from 'node:path'
import type { Response } from 'express'

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'

import {
  createFile,
  deleteUserFile,
  getAccessibleFileById,
  getUserFiles,
  incrementDownloadCount,
} from './file.service.js'

export async function uploadFileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado',
      },
    })
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'FILE_REQUIRED',
        message: 'Debes seleccionar un archivo',
      },
    })
  }

  try {
    const file = await createFile({
      idUsuario: req.user.id_usuario,
      nombreOriginal: req.file.originalname,
      rutaAlmacenamiento: req.file.path,
      mimeType: req.file.mimetype,
      tamanoBytes: req.file.size,
    })

    return res.status(201).json({
      success: true,
      message: 'Archivo cargado correctamente',
      data: {
        file,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No fue posible cargar el archivo',
      },
    })
  }
}

export async function listFilesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado',
      },
    })
  }

  try {
    const files = await getUserFiles(
      req.user.id_usuario,
    )

    return res.status(200).json({
      success: true,
      data: {
        files,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No fue posible obtener los archivos',
      },
    })
  }
}

export async function previewFileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado',
      },
    })
  }

  const idArchivo = Number(req.params.id)

  if (
    !Number.isInteger(idArchivo) ||
    idArchivo <= 0
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_ID',
        message:
          'El identificador del archivo no es válido',
      },
    })
  }

  try {
    const file =
      await getAccessibleFileById(
        req.user.id_usuario,
        idArchivo,
      )

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message:
            'Archivo no encontrado o no tienes acceso',
        },
      })
    }

    if (
      file.estado === 'restringido'
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FILE_RESTRICTED',
          message:
            'El archivo se encuentra restringido',
        },
      })
    }

    const absolutePath =
      path.resolve(
        file.ruta_almacenamiento,
      )

    res.setHeader(
      'Content-Type',
      file.tipo_mime,
    )

    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(
        file.nombre_original,
      )}"`,
    )

    return res.sendFile(
      absolutePath,
    )
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible visualizar el archivo',
      },
    })
  }
}

export async function downloadFileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado',
      },
    })
  }

  const idArchivo = Number(req.params.id)

  if (
    !Number.isInteger(idArchivo) ||
    idArchivo <= 0
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_ID',
        message:
          'El identificador del archivo no es válido',
      },
    })
  }

  try {
    const file =
      await getAccessibleFileById(
        req.user.id_usuario,
        idArchivo,
      )

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message:
            'Archivo no encontrado o no tienes acceso',
        },
      })
    }

    if (
      file.estado === 'restringido'
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FILE_RESTRICTED',
          message:
            'El archivo se encuentra restringido',
        },
      })
    }

    await incrementDownloadCount(
      file,
    )

    return res.download(
      path.resolve(
        file.ruta_almacenamiento,
      ),
      file.nombre_original,
    )
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible descargar el archivo',
      },
    })
  }
}

export async function deleteFileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuario no autenticado',
      },
    })
  }

  const idArchivo = Number(req.params.id)

  if (
    !Number.isInteger(idArchivo) ||
    idArchivo <= 0
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_ID',
        message:
          'El identificador del archivo no es válido',
      },
    })
  }

  try {
    await deleteUserFile(
      req.user.id_usuario,
      idArchivo,
    )

    return res.status(200).json({
      success: true,
      message:
        'Archivo eliminado correctamente',
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'FILE_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message:
            'Archivo no encontrado',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible eliminar el archivo',
      },
    })
  }
}