import type { Response } from 'express'

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'

import {
  actualizarComentario,
  actualizarPublicacion,
  crearComentario,
  crearPublicacion,
  desactivarPublicacion,
  eliminarComentario,
  obtenerComentarios,
  obtenerDestinatarios,
  obtenerPublicacionesVisibles,
  toggleLike,
} from './publication.service.js'

export async function createPublicationController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuario no autenticado',
        },
      })
    }

    const {
      tipo_contenido,
      id_contenido,
      alcance,
      destinatarios,
    } = req.body

    if (
      !tipo_contenido ||
      !id_contenido ||
      !alcance
    ) {
      return res.status(400).json({
        error: {
          message:
            'Tipo de contenido, contenido y alcance son obligatorios',
        },
      })
    }

    if (
      tipo_contenido !== 'archivo' &&
      tipo_contenido !== 'coleccion'
    ) {
      return res.status(400).json({
        error: {
          message:
            'El tipo de contenido debe ser archivo o coleccion',
        },
      })
    }

    if (
      alcance !== 'publica' &&
      alcance !== 'dirigida' &&
      alcance !== 'privada'
    ) {
      return res.status(400).json({
        error: {
          message:
            'El alcance de la publicación no es válido',
        },
      })
    }

    const publicacion =
      await crearPublicacion({
        id_usuario:
          req.user.id_usuario,

        tipo_contenido,

        id_contenido:
          Number(id_contenido),

        alcance,

        destinatarios:
          Array.isArray(destinatarios)
            ? destinatarios.map(Number)
            : [],
      })

    return res.status(201).json({
      message:
        'Publicación guardada correctamente',

      data: publicacion,
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible crear la publicación',
      },
    })
  }
}

export async function listPublicationsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuario no autenticado',
        },
      })
    }

    const publicaciones =
      await obtenerPublicacionesVisibles(
        req.user.id_usuario,
      )

    return res.status(200).json({
      data: publicaciones,
    })
  } catch (error) {
    return res.status(500).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible obtener las publicaciones',
      },
    })
  }
}

export async function updatePublicationController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuario no autenticado',
        },
      })
    }

    const idPublicacion =
      Number(req.params.id)

    if (
      !Number.isInteger(idPublicacion) ||
      idPublicacion <= 0
    ) {
      return res.status(400).json({
        error: {
          message:
            'El identificador de la publicación no es válido',
        },
      })
    }

    const {
      alcance,
      destinatarios,
    } = req.body

    if (
      alcance !== 'publica' &&
      alcance !== 'dirigida' &&
      alcance !== 'privada'
    ) {
      return res.status(400).json({
        error: {
          message:
            'El alcance de la publicación no es válido',
        },
      })
    }

    const publicacion =
      await actualizarPublicacion(
        idPublicacion,
        {
          id_usuario:
            req.user.id_usuario,

          alcance,

          destinatarios:
            Array.isArray(
              destinatarios,
            )
              ? destinatarios.map(
                  Number,
                )
              : [],
        },
      )

    return res.status(200).json({
      message:
        'Publicación actualizada correctamente',

      data: publicacion,
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible actualizar la publicación',
      },
    })
  }
}

export async function toggleLikeController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuario no autenticado',
        },
      })
    }

    const idPublicacion =
      Number(req.params.id)

    if (
      !Number.isInteger(idPublicacion) ||
      idPublicacion <= 0
    ) {
      return res.status(400).json({
        error: {
          message:
            'El identificador de la publicación no es válido',
        },
      })
    }

    const result =
      await toggleLike(
        idPublicacion,
        req.user.id_usuario,
      )

    return res.status(200).json({
      message: result.message,
      data: {
        liked:
          result.liked,
      },
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible actualizar el like',
      },
    })
  }
}

export async function createCommentController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuario no autenticado',
        },
      })
    }

    const idPublicacion =
      Number(req.params.id)

    const {
      contenido,
    } = req.body

    if (
      !Number.isInteger(idPublicacion) ||
      idPublicacion <= 0
    ) {
      return res.status(400).json({
        error: {
          message:
            'El identificador de la publicación no es válido',
        },
      })
    }

    if (
      typeof contenido !== 'string'
    ) {
      return res.status(400).json({
        error: {
          message:
            'El comentario es obligatorio',
        },
      })
    }

    const comentario =
      await crearComentario(
        idPublicacion,
        req.user.id_usuario,
        contenido,
      )

    return res.status(201).json({
      message:
        'Comentario agregado correctamente',

      data: comentario,
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible crear el comentario',
      },
    })
  }
}

export async function listCommentsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuario no autenticado',
        },
      })
    }

    const idPublicacion =
      Number(req.params.id)

    if (
      !Number.isInteger(idPublicacion) ||
      idPublicacion <= 0
    ) {
      return res.status(400).json({
        error: {
          message:
            'El identificador de la publicación no es válido',
        },
      })
    }

    const comentarios =
      await obtenerComentarios(
        idPublicacion,
        req.user.id_usuario,
      )

    return res.status(200).json({
      data: comentarios,
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible obtener los comentarios',
      },
    })
  }
}

export async function updateCommentController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Usuario no autenticado' } })
    }

    const idPublicacion = Number(req.params.id)
    const idComentario = Number(req.params.commentId)
    const { contenido } = req.body

    if (!Number.isInteger(idPublicacion) || idPublicacion <= 0) {
      return res.status(400).json({ error: { message: 'El identificador de la publicación no es válido' } })
    }

    if (!Number.isInteger(idComentario) || idComentario <= 0) {
      return res.status(400).json({ error: { message: 'El identificador del comentario no es válido' } })
    }

    if (typeof contenido !== 'string') {
      return res.status(400).json({ error: { message: 'El comentario es obligatorio' } })
    }

    const comentario = await actualizarComentario(
      idPublicacion, idComentario, req.user.id_usuario, contenido,
    )

    return res.status(200).json({
      message: 'Comentario actualizado correctamente',
      data: comentario,
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message: error instanceof Error
          ? error.message
          : 'No fue posible actualizar el comentario',
      },
    })
  }
}

export async function deleteCommentController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { message: 'Usuario no autenticado' } })
    }

    const idPublicacion = Number(req.params.id)
    const idComentario = Number(req.params.commentId)

    if (!Number.isInteger(idPublicacion) || idPublicacion <= 0) {
      return res.status(400).json({ error: { message: 'El identificador de la publicación no es válido' } })
    }

    if (!Number.isInteger(idComentario) || idComentario <= 0) {
      return res.status(400).json({ error: { message: 'El identificador del comentario no es válido' } })
    }

    const comentario = await eliminarComentario(
      idPublicacion, idComentario, req.user.id_usuario,
    )

    return res.status(200).json({
      message: 'Comentario eliminado correctamente',
      data: comentario,
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message: error instanceof Error
          ? error.message
          : 'No fue posible eliminar el comentario',
      },
    })
  }
}

export async function listRecipientsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuario no autenticado',
        },
      })
    }

    const idPublicacion =
      Number(req.params.id)

    if (
      !Number.isInteger(idPublicacion) ||
      idPublicacion <= 0
    ) {
      return res.status(400).json({
        error: {
          message:
            'El identificador de la publicación no es válido',
        },
      })
    }

    const destinatarios =
      await obtenerDestinatarios(
        idPublicacion,
        req.user.id_usuario,
      )

    return res.status(200).json({
      data: destinatarios,
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible obtener los destinatarios',
      },
    })
  }
}

export async function deactivatePublicationController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          message: 'Usuario no autenticado',
        },
      })
    }

    const idPublicacion =
      Number(req.params.id)

    if (
      !Number.isInteger(idPublicacion) ||
      idPublicacion <= 0
    ) {
      return res.status(400).json({
        error: {
          message:
            'El identificador de la publicación no es válido',
        },
      })
    }

    const publicacion =
      await desactivarPublicacion(
        idPublicacion,
        req.user.id_usuario,
      )

    return res.status(200).json({
      message:
        'Publicación desactivada correctamente',

      data: publicacion,
    })
  } catch (error) {
    return res.status(400).json({
      error: {
        message:
          error instanceof Error
            ? error.message
            : 'No fue posible desactivar la publicación',
      },
    })
  }
}