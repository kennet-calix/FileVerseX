import type { Response } from 'express'

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'

import {
  getAdminStats,
  getAllFiles,
  getAllUsers,
  getFileById,
  getUserById,
  toggleUserBlock,
  updateFileStatus,
} from './admin.service.js'

export async function getAdminStatsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const stats = await getAdminStats()

    return res.status(200).json({
      success: true,
      data: {
        stats,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible obtener las estadísticas administrativas',
      },
    })
  }
}

export async function listUsersController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const users = await getAllUsers()

    return res.status(200).json({
      success: true,
      data: {
        users,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible obtener los usuarios',
      },
    })
  }
}

export async function getUserController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = Number(req.params.id)

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message:
            'El identificador del usuario no es válido',
        },
      })
    }

    const user = await getUserById(idUsuario)

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message:
            'El usuario no fue encontrado',
        },
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible obtener el usuario',
      },
    })
  }
}

export async function blockUserController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = Number(req.params.id)

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message:
            'El identificador del usuario no es válido',
        },
      })
    }

    if (
      req.user?.id_usuario === idUsuario
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_BLOCK_SELF',
          message:
            'No puedes bloquear tu propia cuenta de administrador',
        },
      })
    }

    const user = await toggleUserBlock(
      idUsuario,
      true,
    )

    return res.status(200).json({
      success: true,
      message:
        'Usuario bloqueado correctamente',
      data: {
        user,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'USER_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message:
            'El usuario no fue encontrado',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible bloquear el usuario',
      },
    })
  }
}

export async function unblockUserController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = Number(req.params.id)

    if (
      !Number.isInteger(idUsuario) ||
      idUsuario <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USER_ID',
          message:
            'El identificador del usuario no es válido',
        },
      })
    }

    const user = await toggleUserBlock(
      idUsuario,
      false,
    )

    return res.status(200).json({
      success: true,
      message:
        'Usuario desbloqueado correctamente',
      data: {
        user,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'USER_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message:
            'El usuario no fue encontrado',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible desbloquear el usuario',
      },
    })
  }
}

export async function listAdminFilesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const files = await getAllFiles()

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
        message:
          'No fue posible obtener los archivos',
      },
    })
  }
}

export async function getAdminFileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
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

    const file = await getFileById(idArchivo)

    if (!file) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message:
            'El archivo no fue encontrado',
        },
      })
    }

    return res.status(200).json({
      success: true,
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
        message:
          'No fue posible obtener el archivo',
      },
    })
  }
}

export async function restrictFileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
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

    const file = await updateFileStatus(
      idArchivo,
      'restringido',
    )

    return res.status(200).json({
      success: true,
      message:
        'Archivo restringido correctamente',
      data: {
        file,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'FILE_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message:
            'El archivo no fue encontrado',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible restringir el archivo',
      },
    })
  }
}

export async function activateFileController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
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

    const file = await updateFileStatus(
      idArchivo,
      'activo',
    )

    return res.status(200).json({
      success: true,
      message:
        'Archivo activado correctamente',
      data: {
        file,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'FILE_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message:
            'El archivo no fue encontrado',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible activar el archivo',
      },
    })
  }
}