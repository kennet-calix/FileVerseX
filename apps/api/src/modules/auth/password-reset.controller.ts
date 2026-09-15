import type {
  Request,
  Response,
} from 'express'

import {
  createPasswordResetToken,
  resetPassword,
} from './password-reset.service.js'

export async function forgotPasswordController(
  req: Request,
  res: Response,
) {
  try {
    const email =
      String(
        req.body?.email ?? '',
      )
        .trim()
        .toLowerCase()

    if (!email) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'EMAIL_REQUIRED',

          message:
            'El correo electrónico es obligatorio',
        },
      })
    }

    const result =
      await createPasswordResetToken(
        email,
      )

    /*
      Respuesta genérica para evitar
      revelar si un correo existe
      o no en el sistema.
    */
    const response: {
      success: boolean
      message: string
      data?: {
        resetToken: string
      }
    } = {
      success: true,

      message:
        'Si el correo está registrado, se generó una solicitud para restablecer la contraseña.',
    }

    /*
      SOLO para desarrollo local.

      Más adelante este token se enviará
      por correo y no se devolverá
      en la respuesta.
    */
    if (
      result &&
      process.env.NODE_ENV !==
        'production'
    ) {
      response.data = {
        resetToken:
          result.token,
      }
    }

    return res.status(200).json(
      response,
    )
  } catch (error) {
    console.error(
      'Error forgot password:',
      error,
    )

    return res.status(500).json({
      success: false,

      error: {
        code:
          'FORGOT_PASSWORD_ERROR',

        message:
          'No fue posible procesar la solicitud',
      },
    })
  }
}

export async function resetPasswordController(
  req: Request,
  res: Response,
) {
  try {
    const token =
      String(
        req.body?.token ?? '',
      ).trim()

    const password =
      String(
        req.body?.password ??
          '',
      )

    if (!token) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'TOKEN_REQUIRED',

          message:
            'El token de recuperación es obligatorio',
        },
      })
    }

    if (
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'INVALID_PASSWORD',

          message:
            'La contraseña debe contener al menos 8 caracteres',
        },
      })
    }

    if (
      !/[A-Z]/.test(
        password,
      )
    ) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'INVALID_PASSWORD',

          message:
            'La contraseña debe contener al menos una letra mayúscula',
        },
      })
    }

    if (
      !/[a-z]/.test(
        password,
      )
    ) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'INVALID_PASSWORD',

          message:
            'La contraseña debe contener al menos una letra minúscula',
        },
      })
    }

    if (
      !/[0-9]/.test(
        password,
      )
    ) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'INVALID_PASSWORD',

          message:
            'La contraseña debe contener al menos un número',
        },
      })
    }

    await resetPassword(
      token,
      password,
    )

    return res.status(200).json({
      success: true,

      message:
        'Contraseña actualizada correctamente',
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : ''

    if (
      message ===
        'INVALID_RESET_TOKEN' ||
      message ===
        'INVALID_OR_EXPIRED_RESET_TOKEN'
    ) {
      return res.status(400).json({
        success: false,

        error: {
          code:
            'INVALID_RESET_TOKEN',

          message:
            'El enlace de recuperación es inválido o ha expirado',
        },
      })
    }

    console.error(
      'Error reset password:',
      error,
    )

    return res.status(500).json({
      success: false,

      error: {
        code:
          'RESET_PASSWORD_ERROR',

        message:
          'No fue posible cambiar la contraseña',
      },
    })
  }
}