import bcrypt from 'bcrypt'
import jwt, {
  type JwtPayload,
} from 'jsonwebtoken'

import Usuario from '../user/user.model.js'

interface ResetTokenPayload {
  sub: number
  email: string
  type: 'password-reset'
}

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      'JWT_SECRET_NOT_CONFIGURED',
    )
  }

  return secret
}

function parseResetPayload(
  payload: string | JwtPayload,
): ResetTokenPayload {
  if (
    typeof payload === 'string'
  ) {
    throw new Error(
      'INVALID_RESET_TOKEN',
    )
  }

  const sub =
    Number(payload.sub)

  const email =
    String(
      payload.email ?? '',
    )

  const type =
    payload.type

  if (
    !sub ||
    !email ||
    type !== 'password-reset'
  ) {
    throw new Error(
      'INVALID_RESET_TOKEN',
    )
  }

  return {
    sub,
    email,
    type: 'password-reset',
  }
}

export async function createPasswordResetToken(
  email: string,
) {
  const normalizedEmail =
    email
      .trim()
      .toLowerCase()

  const user =
    await Usuario.findOne({
      where: {
        email:
          normalizedEmail,
      },
    })

  /*
    No revelamos si el correo
    existe o no.
  */
  if (!user) {
    return null
  }

  /*
    Si la cuenta está bloqueada,
    tampoco generamos token.
  */
  if (
    user.esta_bloqueado
  ) {
    return null
  }

  const secret =
    getJwtSecret()

  /*
    Combinamos JWT_SECRET con
    la contraseña actual.

    Al cambiar la contraseña,
    el token anterior deja
    automáticamente de ser válido.
  */
  const resetSecret =
    `${secret}-${user.password_hash}`

  const token =
    jwt.sign(
      {
        sub:
          user.id_usuario,

        email:
          user.email,

        type:
          'password-reset',
      },
      resetSecret,
      {
        expiresIn:
          '15m',
      },
    )

  return {
    token,

    user: {
      id_usuario:
        user.id_usuario,

      email:
        user.email,
    },
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
) {
  /*
    Primero decodificamos el token
    únicamente para conocer
    qué usuario debemos buscar.
  */
  const decoded =
    jwt.decode(
      token,
    )

  if (!decoded) {
    throw new Error(
      'INVALID_RESET_TOKEN',
    )
  }

  const decodedPayload =
    parseResetPayload(
      decoded,
    )

  const user =
    await Usuario.findByPk(
      decodedPayload.sub,
    )

  if (!user) {
    throw new Error(
      'INVALID_RESET_TOKEN',
    )
  }

  if (
    user.esta_bloqueado
  ) {
    throw new Error(
      'INVALID_RESET_TOKEN',
    )
  }

  const secret =
    getJwtSecret()

  /*
    Se reconstruye exactamente
    el mismo secreto utilizado
    cuando se creó el token.
  */
  const resetSecret =
    `${secret}-${user.password_hash}`

  let verifiedPayload:
    ResetTokenPayload

  try {
    const verified =
      jwt.verify(
        token,
        resetSecret,
      )

    verifiedPayload =
      parseResetPayload(
        verified,
      )
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'INVALID_RESET_TOKEN'
    ) {
      throw error
    }

    throw new Error(
      'INVALID_OR_EXPIRED_RESET_TOKEN',
    )
  }

  /*
    Validamos que el usuario
    del token sea exactamente
    el usuario encontrado.
  */
  if (
    verifiedPayload.sub !==
      user.id_usuario ||
    verifiedPayload.email !==
      user.email
  ) {
    throw new Error(
      'INVALID_RESET_TOKEN',
    )
  }

  /*
    Generamos la nueva contraseña
    cifrada con bcrypt.
  */
  const passwordHash =
    await bcrypt.hash(
      newPassword,
      12,
    )

  /*
    Guardamos la nueva contraseña.
  */
  user.password_hash =
    passwordHash

  await user.save()

  return {
    id_usuario:
      user.id_usuario,

    email:
      user.email,
  }
}