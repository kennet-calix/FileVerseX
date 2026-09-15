import Usuario from '../user/user.model.js'
import Archivo from '../files/file.model.js'

const safeUserAttributes = [
  'id_usuario',
  'nombre_completo',
  'email',
  'descripcion',
  'foto_perfil',
  'id_rol',
  'esta_bloqueado',
  'fecha_registro',
]

export async function getAllUsers() {
  return Usuario.findAll({
    attributes: safeUserAttributes,
    order: [['fecha_registro', 'DESC']],
  })
}

export async function getUserById(
  idUsuario: number,
) {
  return Usuario.findByPk(idUsuario, {
    attributes: safeUserAttributes,
  })
}

export async function toggleUserBlock(
  idUsuario: number,
  blocked: boolean,
) {
  const user = await Usuario.findByPk(idUsuario)

  if (!user) {
    throw new Error('USER_NOT_FOUND')
  }

  user.esta_bloqueado = blocked

  await user.save()

  return Usuario.findByPk(idUsuario, {
    attributes: safeUserAttributes,
  })
}

export async function getAllFiles() {
  return Archivo.findAll({
    order: [['fecha_subida', 'DESC']],
  })
}

export async function getFileById(
  idArchivo: number,
) {
  return Archivo.findByPk(idArchivo)
}

export async function updateFileStatus(
  idArchivo: number,
  estado: 'activo' | 'restringido',
) {
  const file = await Archivo.findByPk(idArchivo)

  if (!file) {
    throw new Error('FILE_NOT_FOUND')
  }

  file.estado = estado

  await file.save()

  return file
}

export async function getAdminStats() {
  const [
    totalUsuarios,
    usuariosBloqueados,
    totalArchivos,
    archivosRestringidos,
  ] = await Promise.all([
    Usuario.count(),

    Usuario.count({
      where: {
        esta_bloqueado: true,
      },
    }),

    Archivo.count(),

    Archivo.count({
      where: {
        estado: 'restringido',
      },
    }),
  ])

  return {
    totalUsuarios,
    usuariosBloqueados,
    totalArchivos,
    archivosRestringidos,
  }
}