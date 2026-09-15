import { Op } from 'sequelize'

import Usuario from './user.model.js'

interface UpdateProfileInput {
  nombreCompleto: string
  descripcion?: string
}

export async function getCurrentUser(
  idUsuario: number,
) {
  const user =
    await Usuario.findByPk(
      idUsuario,
      {
        attributes: [
          'id_usuario',
          'nombre_completo',
          'email',
          'descripcion',
          'foto_perfil',
          'id_rol',
          'esta_bloqueado',
          'fecha_registro',
        ],
      },
    )

  if (!user) {
    throw new Error(
      'USER_NOT_FOUND',
    )
  }

  return user
}

export async function getAvailableUsers(
  currentUserId: number,
) {
  const users =
    await Usuario.findAll({
      where: {
        id_usuario: {
          [Op.ne]:
            currentUserId,
        },

        esta_bloqueado:
          false,
      },

      attributes: [
        'id_usuario',
        'nombre_completo',
        'email',
        'foto_perfil',
        'id_rol',
      ],

      order: [
        [
          'nombre_completo',
          'ASC',
        ],
      ],
    })

  return users
}

export async function updateUserProfile(
  idUsuario: number,
  data: UpdateProfileInput,
) {
  const user =
    await Usuario.findByPk(
      idUsuario,
    )

  if (!user) {
    throw new Error(
      'USER_NOT_FOUND',
    )
  }

  user.nombre_completo =
    data.nombreCompleto.trim()

  user.descripcion =
    data.descripcion?.trim() ||
    null

  await user.save()

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