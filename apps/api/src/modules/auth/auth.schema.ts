import { z } from 'zod'

export const registerSchema = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(3, 'El nombre debe contener al menos 3 caracteres')
    .max(150, 'El nombre no puede superar 150 caracteres'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('El correo electrónico no es válido')
    .max(150),

  password: z
    .string()
    .min(8, 'La contraseña debe contener al menos 8 caracteres')
    .regex(
      /[A-Z]/,
      'La contraseña debe incluir al menos una letra mayúscula',
    )
    .regex(
      /[a-z]/,
      'La contraseña debe incluir al menos una letra minúscula',
    )
    .regex(
      /[0-9]/,
      'La contraseña debe incluir al menos un número',
    ),

  descripcion: z
    .string()
    .trim()
    .max(250, 'La descripción no puede superar 250 caracteres')
    .optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('El correo electrónico no es válido'),

  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
})

export type LoginInput = z.infer<typeof loginSchema>