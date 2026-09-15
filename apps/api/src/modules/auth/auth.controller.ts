import type { Request, Response } from 'express'

import {
  loginSchema,
  registerSchema,
} from './auth.schema.js'

import {
  loginUser,
  registerUser,
} from './auth.service.js'

export async function registerController(
  req: Request,
  res: Response,
) {
  const validation = registerSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos enviados no son válidos',
        details: validation.error.flatten().fieldErrors,
      },
    })
  }

  try {
    const user = await registerUser(validation.data)

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: {
        user,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'EMAIL_ALREADY_EXISTS'
    ) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'Ya existe una cuenta con este correo electrónico',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No fue posible crear la cuenta',
      },
    })
  }
}

export async function loginController(
  req: Request,
  res: Response,
) {
  const validation = loginSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Los datos enviados no son válidos',
        details: validation.error.flatten().fieldErrors,
      },
    })
  }

  try {
    const result = await loginUser(validation.data)

    return res.status(200).json({
      success: true,
      message: 'Inicio de sesión correcto',
      data: result,
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'INVALID_CREDENTIALS'
    ) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Correo electrónico o contraseña incorrectos',
        },
      })
    }

    if (
      error instanceof Error &&
      error.message === 'USER_BLOCKED'
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'USER_BLOCKED',
          message: 'La cuenta se encuentra bloqueada',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'No fue posible iniciar sesión',
      },
    })
  }
}