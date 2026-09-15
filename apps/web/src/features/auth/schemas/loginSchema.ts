import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo electrónico es obligatorio')
    .email('Ingresa un correo electrónico válido'),

  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .min(8, 'La contraseña debe contener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe incluir al menos una letra mayúscula')
    .regex(/[0-9]/, 'La contraseña debe incluir al menos un caracter numérico'),
})

export type LoginFormData = z.infer<typeof loginSchema>