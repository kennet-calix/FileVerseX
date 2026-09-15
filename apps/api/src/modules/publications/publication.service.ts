import { Op } from 'sequelize'

import Archivo from '../files/file.model.js'
import Coleccion from '../collections/collection.model.js'
import Usuario from '../user/user.model.js'

import Publicacion from './publication.model.js'
import PublicacionDestinatario from './publication-recipient.model.js'
import Like from './like.model.js'
import Comentario from './comment.model.js'
import HistorialPublicacion from './publication-history.model.js'

type AlcancePublicacion =
  | 'publica'
  | 'dirigida'
  | 'privada'

type TipoContenido =
  | 'archivo'
  | 'coleccion'

interface CrearPublicacionInput {
  id_usuario: number
  tipo_contenido: TipoContenido
  id_contenido: number
  alcance: AlcancePublicacion
  destinatarios?: number[]
}

interface ActualizarPublicacionInput {
  id_usuario: number
  alcance: AlcancePublicacion
  destinatarios?: number[]
}

/*
 * ============================================================
 * CREAR PUBLICACIÓN
 * ============================================================
 */
export async function crearPublicacion(
  input: CrearPublicacionInput,
) {
  const {
    id_usuario,
    tipo_contenido,
    id_contenido,
    alcance,
    destinatarios = [],
  } = input

  /*
   * Si la publicación es dirigida,
   * validamos primero los usuarios.
   */
  const destinatariosValidados =
    alcance === 'dirigida'
      ? await validarDestinatarios(
          destinatarios,
          id_usuario,
        )
      : []

  /*
   * ==========================================================
   * PUBLICACIÓN DE ARCHIVO
   * ==========================================================
   */
  if (
    tipo_contenido === 'archivo'
  ) {
    const archivo =
      await Archivo.findOne({
        where: {
          id_archivo:
            id_contenido,

          id_usuario,
        },
      })

    if (!archivo) {
      throw new Error(
        'El archivo no existe o no pertenece al usuario',
      )
    }

    /*
     * Un archivo solamente puede
     * tener una publicación.
     */
    const publicacionExistente =
      await Publicacion.findOne({
        where: {
          id_archivo:
            id_contenido,
        },
      })

    /*
     * Si ya existe, no creamos otra.
     * Actualizamos la publicación.
     */
    if (
      publicacionExistente
    ) {
      return actualizarPublicacion(
        publicacionExistente
          .id_publicacion,
        {
          id_usuario,
          alcance,

          destinatarios:
            destinatariosValidados,
        },
      )
    }

    /*
     * Crear publicación nueva.
     */
    const publicacion =
      await Publicacion.create({
        id_usuario,

        tipo_contenido:
          'archivo',

        id_archivo:
          id_contenido,

        id_coleccion:
          null,

        alcance,

        esta_activa:
          true,
      })

    /*
     * Guardar destinatarios
     * cuando sea dirigida.
     */
    if (
      alcance === 'dirigida'
    ) {
      await guardarDestinatarios(
        publicacion.id_publicacion,
        destinatariosValidados,
      )
    }

    /*
     * ========================================================
     * HISTORIAL INICIAL
     * ========================================================
     */
    await HistorialPublicacion.create({
      id_publicacion:
        publicacion.id_publicacion,

      id_usuario,

      alcance_anterior:
        null,

      alcance_nuevo:
        alcance,

      destinatarios_snapshot:
        alcance === 'dirigida'
          ? destinatariosValidados
          : null,

      likes_acumulados:
        0,

      comentarios_acumulados:
        0,
    })

    return publicacion
  }

  /*
   * ==========================================================
   * PUBLICACIÓN DE COLECCIÓN
   * ==========================================================
   */
  const coleccion =
    await Coleccion.findOne({
      where: {
        id_coleccion:
          id_contenido,

        id_usuario,
      },
    })

  if (!coleccion) {
    throw new Error(
      'La colección no existe o no pertenece al usuario',
    )
  }

  /*
   * Verificar si la colección
   * ya tiene publicación.
   */
  const publicacionExistente =
    await Publicacion.findOne({
      where: {
        id_coleccion:
          id_contenido,
      },
    })

  if (
    publicacionExistente
  ) {
    return actualizarPublicacion(
      publicacionExistente
        .id_publicacion,
      {
        id_usuario,
        alcance,

        destinatarios:
          destinatariosValidados,
      },
    )
  }

  /*
   * Crear nueva publicación
   * para la colección.
   */
  const publicacion =
    await Publicacion.create({
      id_usuario,

      tipo_contenido:
        'coleccion',

      id_archivo:
        null,

      id_coleccion:
        id_contenido,

      alcance,

      esta_activa:
        true,
    })

  if (
    alcance === 'dirigida'
  ) {
    await guardarDestinatarios(
      publicacion.id_publicacion,
      destinatariosValidados,
    )
  }

  /*
   * HISTORIAL INICIAL
   */
  await HistorialPublicacion.create({
    id_publicacion:
      publicacion.id_publicacion,

    id_usuario,

    alcance_anterior:
      null,

    alcance_nuevo:
      alcance,

    destinatarios_snapshot:
      alcance === 'dirigida'
        ? destinatariosValidados
        : null,

    likes_acumulados:
      0,

    comentarios_acumulados:
      0,
  })

  return publicacion
}

/*
 * ============================================================
 * ACTUALIZAR PUBLICACIÓN
 * ============================================================
 */
export async function actualizarPublicacion(
  id_publicacion: number,
  input: ActualizarPublicacionInput,
) {
  const {
    id_usuario,
    alcance,
    destinatarios = [],
  } = input

  /*
   * Verificar que la publicación
   * pertenece al usuario.
   */
  const publicacion =
    await Publicacion.findOne({
      where: {
        id_publicacion,
        id_usuario,
      },
    })

  if (!publicacion) {
    throw new Error(
      'La publicación no existe o no pertenece al usuario',
    )
  }

  /*
   * Validar los nuevos destinatarios
   * antes de modificar la publicación.
   */
  const destinatariosValidados =
    alcance === 'dirigida'
      ? await validarDestinatarios(
          destinatarios,
          id_usuario,
        )
      : []

  const alcanceAnterior =
    publicacion.alcance

  /*
   * ==========================================================
   * DESTINATARIOS ACTUALES
   * ==========================================================
   */
  const destinatariosActuales =
    await PublicacionDestinatario.findAll({
      where: {
        id_publicacion,
      },

      attributes: [
        'id_usuario',
      ],
    })

  const idsDestinatariosActuales =
    destinatariosActuales
      .map(
        (item) =>
          Number(
            item.id_usuario,
          ),
      )
      .sort(
        (a, b) =>
          a - b,
      )

  const idsDestinatariosNuevos = [
    ...destinatariosValidados,
  ].sort(
    (a, b) =>
      a - b,
  )

  /*
   * ==========================================================
   * DETECTAR CAMBIO
   * ==========================================================
   */
  const cambioAlcance =
    alcanceAnterior !==
    alcance

  const cambioDestinatarios =
    !sonArraysIguales(
      idsDestinatariosActuales,

      alcance === 'dirigida'
        ? idsDestinatariosNuevos
        : [],
    )

  /*
   * Si no cambió absolutamente nada,
   * no generamos historial innecesario.
   */
  if (
    !cambioAlcance &&
    !cambioDestinatarios
  ) {
    publicacion.esta_activa =
      true

    publicacion.fecha_actualizacion =
      new Date()

    await publicacion.save()

    return publicacion
  }

  /*
   * ==========================================================
   * SNAPSHOT DE LIKES Y COMENTARIOS
   * ==========================================================
   *
   * Se calcula ANTES de modificar
   * la publicación.
   */
  const [
    likesAcumulados,
    comentariosAcumulados,
  ] = await Promise.all([
    Like.count({
      where: {
        id_publicacion,
      },
    }),

    Comentario.count({
      where: {
        id_publicacion,
      },
    }),
  ])

  /*
   * ==========================================================
   * ACTUALIZAR PUBLICACIÓN
   * ==========================================================
   */
  publicacion.alcance =
    alcance

  publicacion.esta_activa =
    true

  publicacion.fecha_actualizacion =
    new Date()

  await publicacion.save()

  /*
   * Eliminar destinatarios
   * correspondientes al estado anterior.
   */
  await PublicacionDestinatario.destroy({
    where: {
      id_publicacion,
    },
  })

  /*
   * Si el nuevo alcance es dirigido,
   * guardamos los nuevos destinatarios.
   */
  if (
    alcance === 'dirigida'
  ) {
    await guardarDestinatarios(
      id_publicacion,
      destinatariosValidados,
    )
  }

  /*
   * ==========================================================
   * REGISTRAR HISTORIAL
   * ==========================================================
   */
  await HistorialPublicacion.create({
    id_publicacion,

    id_usuario,

    alcance_anterior:
      alcanceAnterior,

    alcance_nuevo:
      alcance,

    destinatarios_snapshot:
      alcance === 'dirigida'
        ? idsDestinatariosNuevos
        : null,

    likes_acumulados:
      likesAcumulados,

    comentarios_acumulados:
      comentariosAcumulados,
  })

  return publicacion
}

/*
 * ============================================================
 * VALIDAR DESTINATARIOS
 * ============================================================
 */
async function validarDestinatarios(
  destinatarios: number[],
  propietarioId: number,
) {
  /*
   * Eliminar duplicados,
   * valores inválidos
   * y el propio propietario.
   */
  const destinatariosUnicos = [
    ...new Set(
      destinatarios.map(
        Number,
      ),
    ),
  ].filter(
    (id) =>
      id !== propietarioId &&
      Number.isInteger(id) &&
      id > 0,
  )

  if (
    destinatariosUnicos.length ===
    0
  ) {
    throw new Error(
      'Debes seleccionar al menos un usuario diferente al propietario',
    )
  }

  /*
   * Verificar que todos
   * los usuarios existan
   * y estén habilitados.
   */
  const usuarios =
    await Usuario.findAll({
      where: {
        id_usuario: {
          [Op.in]:
            destinatariosUnicos,
        },

        esta_bloqueado:
          false,
      },

      attributes: [
        'id_usuario',
      ],
    })

  if (
    usuarios.length !==
    destinatariosUnicos.length
  ) {
    throw new Error(
      'Uno o más destinatarios no son válidos',
    )
  }

  return destinatariosUnicos
}

/*
 * ============================================================
 * GUARDAR DESTINATARIOS
 * ============================================================
 */
async function guardarDestinatarios(
  id_publicacion: number,
  destinatarios: number[],
) {
  if (
    destinatarios.length ===
    0
  ) {
    return
  }

  await PublicacionDestinatario.bulkCreate(
    destinatarios.map(
      (id_usuario) => ({
        id_publicacion,
        id_usuario,
      }),
    ),
  )
}

/*
 * ============================================================
 * COMPARAR ARRAYS DE DESTINATARIOS
 * ============================================================
 */
function sonArraysIguales(
  primerArray: number[],
  segundoArray: number[],
) {
  if (
    primerArray.length !==
    segundoArray.length
  ) {
    return false
  }

  return primerArray.every(
    (
      value,
      index,
    ) =>
      value ===
      segundoArray[index],
  )
}

/*
 * ============================================================
 * OBTENER PUBLICACIONES VISIBLES
 * ============================================================
 *
 * Devuelve:
 *
 * - nombre_contenido
 * - tipo_mime
 * - autor
 * - total_likes
 * - total_comentarios
 * - usuario_dio_like
 */
export async function obtenerPublicacionesVisibles(
  id_usuario: number,
) {
  const publicaciones =
    await Publicacion.findAll({
      where: {
        esta_activa:
          true,
      },

      order: [
        [
          'fecha_actualizacion',
          'DESC',
        ],
      ],
    })

  const resultado = []

  for (
    const publicacion
    of publicaciones
  ) {
    const esPropietario =
      publicacion.id_usuario ===
      id_usuario

    let tieneAcceso =
      esPropietario ||
      publicacion.alcance ===
        'publica'

    /*
     * PUBLICACIÓN DIRIGIDA
     */
    if (
      publicacion.alcance ===
        'dirigida' &&
      !esPropietario
    ) {
      const destinatario =
        await PublicacionDestinatario.findOne(
          {
            where: {
              id_publicacion:
                publicacion
                  .id_publicacion,

              id_usuario,
            },
          },
        )

      tieneAcceso =
        Boolean(
          destinatario,
        )
    }

    /*
     * SIN ACCESO
     */
    if (!tieneAcceso) {
      continue
    }

    /*
     * DATOS DEL AUTOR
     */
    const autor =
      await Usuario.findByPk(
        publicacion.id_usuario,
        {
          attributes: [
            'id_usuario',
            'nombre_completo',
            'email',
            'foto_perfil',
          ],
        },
      )

    /*
     * INFORMACIÓN DEL CONTENIDO
     */
    let nombreContenido =
      'Contenido sin nombre'

    let tipoMime:
      string | null = null

    /*
     * ARCHIVO
     */
    if (
      publicacion.tipo_contenido ===
        'archivo' &&
      publicacion.id_archivo
    ) {
      const archivo =
        await Archivo.findByPk(
          publicacion.id_archivo,
        )

      if (archivo) {
        nombreContenido =
          archivo.nombre_original

        tipoMime =
          archivo.tipo_mime
      } else {
        nombreContenido =
          `Archivo #${publicacion.id_archivo}`
      }
    }

    /*
     * COLECCIÓN
     */
    if (
      publicacion.tipo_contenido ===
        'coleccion' &&
      publicacion.id_coleccion
    ) {
      const coleccion =
        await Coleccion.findByPk(
          publicacion.id_coleccion,
        )

      if (coleccion) {
        nombreContenido =
          coleccion.nombre
      } else {
        nombreContenido =
          `Colección #${publicacion.id_coleccion}`
      }
    }

    /*
     * LIKES Y COMENTARIOS
     */
    const [
      totalLikes,
      totalComentarios,
      likeUsuario,
    ] = await Promise.all([
      Like.count({
        where: {
          id_publicacion:
            publicacion
              .id_publicacion,
        },
      }),

      Comentario.count({
        where: {
          id_publicacion:
            publicacion
              .id_publicacion,
        },
      }),

      Like.findOne({
        where: {
          id_publicacion:
            publicacion
              .id_publicacion,

          id_usuario,
        },
      }),
    ])

    resultado.push({
      ...publicacion.toJSON(),

      nombre_contenido:
        nombreContenido,

      tipo_mime:
        tipoMime,

      autor: autor
        ? {
            id_usuario:
              autor.id_usuario,

            nombre_completo:
              autor.nombre_completo,

            email:
              autor.email,

            foto_perfil:
              autor.foto_perfil,
          }
        : null,

      total_likes:
        totalLikes,

      total_comentarios:
        totalComentarios,

      usuario_dio_like:
        Boolean(
          likeUsuario,
        ),
    })
  }

  return resultado
}

/*
 * ============================================================
 * VERIFICAR ACCESO A UNA PUBLICACIÓN
 * ============================================================
 */
export async function verificarAccesoPublicacion(
  id_publicacion: number,
  id_usuario: number,
) {
  const publicacion =
    await Publicacion.findByPk(
      id_publicacion,
    )

  if (
    !publicacion ||
    !publicacion.esta_activa
  ) {
    return null
  }

  /*
   * PROPIETARIO
   */
  if (
    publicacion.id_usuario ===
    id_usuario
  ) {
    return publicacion
  }

  /*
   * PÚBLICA
   */
  if (
    publicacion.alcance ===
    'publica'
  ) {
    return publicacion
  }

  /*
   * PRIVADA
   */
  if (
    publicacion.alcance ===
    'privada'
  ) {
    return null
  }

  /*
   * DIRIGIDA
   */
  const destinatario =
    await PublicacionDestinatario.findOne(
      {
        where: {
          id_publicacion,
          id_usuario,
        },
      },
    )

  return destinatario
    ? publicacion
    : null
}

/*
 * ============================================================
 * LIKE
 * ============================================================
 */
export async function toggleLike(
  id_publicacion: number,
  id_usuario: number,
) {
  const publicacion =
    await verificarAccesoPublicacion(
      id_publicacion,
      id_usuario,
    )

  if (!publicacion) {
    throw new Error(
      'No tienes acceso a esta publicación',
    )
  }

  const like =
    await Like.findOne({
      where: {
        id_publicacion,
        id_usuario,
      },
    })

  /*
   * QUITAR LIKE
   */
  if (like) {
    await like.destroy()

    return {
      liked:
        false,

      message:
        'Like eliminado correctamente',
    }
  }

  /*
   * AGREGAR LIKE
   */
  await Like.create({
    id_publicacion,
    id_usuario,
  })

  return {
    liked:
      true,

    message:
      'Like agregado correctamente',
  }
}

/*
 * ============================================================
 * CREAR COMENTARIO
 * ============================================================
 */
export async function crearComentario(
  id_publicacion: number,
  id_usuario: number,
  contenido: string,
) {
  const texto =
    contenido.trim()

  if (!texto) {
    throw new Error(
      'El comentario no puede estar vacío',
    )
  }

  if (
    texto.length > 1000
  ) {
    throw new Error(
      'El comentario no puede superar los 1000 caracteres',
    )
  }

  const publicacion =
    await verificarAccesoPublicacion(
      id_publicacion,
      id_usuario,
    )

  if (!publicacion) {
    throw new Error(
      'No tienes acceso a esta publicación',
    )
  }

  return Comentario.create({
    id_publicacion,
    id_usuario,

    contenido:
      texto,
  })
}

/*
 * ============================================================
 * OBTENER COMENTARIOS
 * ============================================================
 */
export async function obtenerComentarios(
  id_publicacion: number,
  id_usuario: number,
) {
  const publicacion =
    await verificarAccesoPublicacion(
      id_publicacion,
      id_usuario,
    )

  if (!publicacion) {
    throw new Error(
      'No tienes acceso a esta publicación',
    )
  }

  const comentarios =
    await Comentario.findAll({
      where: {
        id_publicacion,
      },

      order: [
        [
          'fecha_comentario',
          'ASC',
        ],
      ],
    })

  /*
   * Enriquecer comentarios
   * con información del usuario.
   */
  const resultado = []

  for (
    const comentario
    of comentarios
  ) {
    const usuario =
      await Usuario.findByPk(
        comentario.id_usuario,
        {
          attributes: [
            'id_usuario',
            'nombre_completo',
            'foto_perfil',
          ],
        },
      )

    resultado.push({
      ...comentario.toJSON(),

      usuario: usuario
        ? {
            id_usuario:
              usuario.id_usuario,

            nombre_completo:
              usuario.nombre_completo,

            foto_perfil:
              usuario.foto_perfil,
          }
        : null,
    })
  }

  return resultado
}

/*
 * ============================================================
 * OBTENER DESTINATARIOS
 * ============================================================
 */
export async function obtenerDestinatarios(
  id_publicacion: number,
  id_usuario: number,
) {
  const publicacion =
    await Publicacion.findOne({
      where: {
        id_publicacion,
        id_usuario,
      },
    })

  if (!publicacion) {
    throw new Error(
      'La publicación no existe o no pertenece al usuario',
    )
  }

  return PublicacionDestinatario.findAll({
    where: {
      id_publicacion,
    },
  })
}

/*
 * ============================================================
 * DESACTIVAR PUBLICACIÓN
 * ============================================================
 */
export async function desactivarPublicacion(
  id_publicacion: number,
  id_usuario: number,
) {
  const publicacion =
    await Publicacion.findOne({
      where: {
        id_publicacion,
        id_usuario,
      },
    })

  if (!publicacion) {
    throw new Error(
      'La publicación no existe o no pertenece al usuario',
    )
  }

  publicacion.esta_activa =
    false

  publicacion.fecha_actualizacion =
    new Date()

  await publicacion.save()

  return publicacion
}