import { z } from 'zod'

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'El nombre es obligatorio')
      .min(3, 'El nombre debe contener al menos 3 caracteres')
      .max(80, 'El nombre es demasiado largo'),

    email: z
      .string()
      .min(1, 'El correo electrónico es obligatorio')
      .email('Ingresa un correo electrónico válido'),

    description: z
      .string()
      .max(250, 'La descripción no puede superar 250 caracteres')
      .optional(),

    password: z
      .string()
      .min(8, 'La contraseña debe contener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe incluir al menos una letra mayúscula')
      .regex(/[a-z]/, 'Debe incluir al menos una letra minúscula')
      .regex(/[0-9]/, 'Debe incluir al menos un número'),

    confirmPassword: z
      .string()
      .min(1, 'Debes confirmar la contraseña'),

    acceptTerms: z
      .boolean()
      .refine((value) => value === true, {
        message: 'Debes aceptar los términos y condiciones',
      }),
  })
  .refine(
    (data) => data.password === data.confirmPassword,
    {
      message: 'Las contraseñas no coinciden',
      path: ['confirmPassword'],
    },
  )

export type RegisterFormData = z.infer<typeof registerSchema>