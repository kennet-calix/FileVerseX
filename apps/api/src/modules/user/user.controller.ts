import type {
  Response,
} from 'express'

import type {
  AuthenticatedRequest,
} from '../../middleware/auth.middleware.js'

import {
  getAvailableUsers,
  getCurrentUser,
  updateUserProfile,
} from './user.service.js'

export async function getAvailableUsersController(
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
    const users =
      await getAvailableUsers(
        req.user.id_usuario,
      )

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
        code:
          'INTERNAL_SERVER_ERROR',

        message:
          'No fue posible obtener los usuarios',
      },
    })
  }
}

export async function getMeController(
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
    const user =
      await getCurrentUser(
        req.user.id_usuario,
      )

    return res.status(200).json({
      success: true,

      data: {
        user,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'USER_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,

        error: {
          code:
            'USER_NOT_FOUND',

          message:
            'El usuario no fue encontrado',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,

      error: {
        code:
          'INTERNAL_SERVER_ERROR',

        message:
          'No fue posible obtener el perfil',
      },
    })
  }
}

export async function updateMyProfileController(
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
    const nombreCompleto =
      String(
        req.body.nombreCompleto ??
          '',
      ).trim()

    const descripcion =
      String(
        req.body.descripcion ??
          '',
      ).trim()

    if (
      nombreCompleto.length <
      3
    ) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'INVALID_NAME',

          message:
            'El nombre debe contener al menos 3 caracteres',
        },
      })
    }

    if (
      nombreCompleto.length >
      150
    ) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'INVALID_NAME',

          message:
            'El nombre no puede superar 150 caracteres',
        },
      })
    }

    if (
      descripcion.length > 250
    ) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'INVALID_DESCRIPTION',

          message:
            'La descripción no puede superar 250 caracteres',
        },
      })
    }

    const user =
      await updateUserProfile(
        req.user.id_usuario,
        {
          nombreCompleto,
          descripcion,
        },
      )

    return res.status(200).json({
      success: true,

      message:
        'Perfil actualizado correctamente',

      data: {
        user,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'USER_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,

        error: {
          code:
            'USER_NOT_FOUND',

          message:
            'El usuario no fue encontrado',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,

      error: {
        code:
          'INTERNAL_SERVER_ERROR',

        message:
          'No fue posible actualizar el perfil',
      },
    })
  }
}