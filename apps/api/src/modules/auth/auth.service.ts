import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import Usuario from '../user/user.model.js'

import type {
  LoginInput,
  RegisterInput,
} from './auth.schema.js'

export async function registerUser(
  data: RegisterInput,
) {
  const email =
    data.email.toLowerCase().trim()

  const existingUser =
    await Usuario.findOne({
      where: {
        email,
      },
    })

  if (existingUser) {
    throw new Error(
      'EMAIL_ALREADY_EXISTS',
    )
  }

  const passwordHash =
    await bcrypt.hash(
      data.password,
      12,
    )

  const user =
    await Usuario.create({
      nombre_completo:
        data.nombreCompleto.trim(),

      email,

      password_hash:
        passwordHash,

      descripcion:
        data.descripcion?.trim() ||
        null,
    })

  return {
    id_usuario:
      user.id_usuario,

    nombre_completo:
      user.nombre_completo,

    email:
      user.email,

    descripcion:
      user.descripcion,

    foto_perfil:
      user.foto_perfil,

    id_rol:
      user.id_rol,

    esta_bloqueado:
      user.esta_bloqueado,

    fecha_registro:
      user.fecha_registro,
  }
}

export async function loginUser(
  data: LoginInput,
) {
  const email =
    data.email.toLowerCase().trim()

  const user =
    await Usuario.findOne({
      where: {
        email,
      },
    })

  if (!user) {
    throw new Error(
      'INVALID_CREDENTIALS',
    )
  }

  if (user.esta_bloqueado) {
    throw new Error(
      'USER_BLOCKED',
    )
  }

  const passwordIsValid =
    await bcrypt.compare(
      data.password,
      user.password_hash,
    )

  if (!passwordIsValid) {
    throw new Error(
      'INVALID_CREDENTIALS',
    )
  }

  const jwtSecret =
    process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET_NOT_CONFIGURED',
    )
  }

  const token = jwt.sign(
    {
      sub: user.id_usuario,
      role: user.id_rol,
      email: user.email,
    },
    jwtSecret,
    {
      expiresIn: '2h',
    },
  )

  return {
    user: {
      id_usuario:
        user.id_usuario,

      nombre_completo:
        user.nombre_completo,

      email:
        user.email,

      descripcion:
        user.descripcion,

      foto_perfil:
        user.foto_perfil,

      id_rol:
        user.id_rol,

      esta_bloqueado:
        user.esta_bloqueado,
    },

    token,
  }
}