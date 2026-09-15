import type {
  Request,
  Response,
} from 'express'

import type { AuthenticatedRequest } from '../../middleware/auth.middleware.js'

import {
  addFileToCollection,
  createCollection,
  deleteCollection,
  getCollectionFiles,
  getUserCollections,
  removeFileFromCollection,
  updateCollection,
} from './collection.service.js'

export async function createCollectionController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = req.user?.id_usuario
    const { nombre, descripcion } = req.body

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      })
    }

    if (
      !nombre ||
      typeof nombre !== 'string' ||
      !nombre.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COLLECTION_NAME',
          message:
            'El nombre de la colección es obligatorio',
        },
      })
    }

    const collection =
      await createCollection({
        idUsuario,
        nombre,
        descripcion,
      })

    return res.status(201).json({
      success: true,
      message:
        'Colección creada correctamente',
      data: {
        collection,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.name ===
        'SequelizeUniqueConstraintError'
    ) {
      return res.status(409).json({
        success: false,
        error: {
          code:
            'COLLECTION_NAME_ALREADY_EXISTS',
          message:
            'Ya existe una colección con ese nombre',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible crear la colección',
      },
    })
  }
}

export async function listCollectionsController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = req.user?.id_usuario

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      })
    }

    const collections =
      await getUserCollections(idUsuario)

    return res.status(200).json({
      success: true,
      data: {
        collections,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible obtener las colecciones',
      },
    })
  }
}

export async function updateCollectionController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = req.user?.id_usuario
    const idColeccion = Number(req.params.id)
    const { nombre, descripcion } = req.body

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      })
    }

    if (
      !Number.isInteger(idColeccion) ||
      idColeccion <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COLLECTION_ID',
          message:
            'El identificador de la colección no es válido',
        },
      })
    }

    if (
      !nombre ||
      typeof nombre !== 'string' ||
      !nombre.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COLLECTION_NAME',
          message:
            'El nombre de la colección es obligatorio',
        },
      })
    }

    const collection =
      await updateCollection(
        idUsuario,
        idColeccion,
        nombre,
        descripcion,
      )

    return res.status(200).json({
      success: true,
      message:
        'Colección actualizada correctamente',
      data: {
        collection,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'COLLECTION_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COLLECTION_NOT_FOUND',
          message:
            'La colección no fue encontrada',
        },
      })
    }

    if (
      error instanceof Error &&
      error.name ===
        'SequelizeUniqueConstraintError'
    ) {
      return res.status(409).json({
        success: false,
        error: {
          code:
            'COLLECTION_NAME_ALREADY_EXISTS',
          message:
            'Ya existe una colección con ese nombre',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible actualizar la colección',
      },
    })
  }
}

export async function deleteCollectionController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = req.user?.id_usuario
    const idColeccion = Number(req.params.id)

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      })
    }

    if (
      !Number.isInteger(idColeccion) ||
      idColeccion <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COLLECTION_ID',
          message:
            'El identificador de la colección no es válido',
        },
      })
    }

    await deleteCollection(
      idUsuario,
      idColeccion,
    )

    return res.status(200).json({
      success: true,
      message:
        'Colección eliminada correctamente',
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'COLLECTION_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COLLECTION_NOT_FOUND',
          message:
            'La colección no fue encontrada',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible eliminar la colección',
      },
    })
  }
}

export async function addFileToCollectionController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = req.user?.id_usuario
    const idColeccion = Number(
      req.params.id,
    )
    const idArchivo = Number(
      req.params.fileId,
    )

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      })
    }

    if (
      !Number.isInteger(idColeccion) ||
      !Number.isInteger(idArchivo) ||
      idColeccion <= 0 ||
      idArchivo <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message:
            'Los identificadores enviados no son válidos',
        },
      })
    }

    const relation =
      await addFileToCollection(
        idUsuario,
        idColeccion,
        idArchivo,
      )

    return res.status(201).json({
      success: true,
      message:
        'Archivo agregado a la colección correctamente',
      data: {
        relation,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'COLLECTION_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COLLECTION_NOT_FOUND',
          message:
            'La colección no fue encontrada',
        },
      })
    }

    if (
      error instanceof Error &&
      error.message === 'FILE_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'FILE_NOT_FOUND',
          message:
            'El archivo no fue encontrado',
        },
      })
    }

    if (
      error instanceof Error &&
      error.message ===
        'FILE_ALREADY_IN_COLLECTION'
    ) {
      return res.status(409).json({
        success: false,
        error: {
          code:
            'FILE_ALREADY_IN_COLLECTION',
          message:
            'El archivo ya pertenece a esta colección',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible agregar el archivo a la colección',
      },
    })
  }
}

export async function removeFileFromCollectionController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = req.user?.id_usuario
    const idColeccion = Number(
      req.params.id,
    )
    const idArchivo = Number(
      req.params.fileId,
    )

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      })
    }

    if (
      !Number.isInteger(idColeccion) ||
      !Number.isInteger(idArchivo) ||
      idColeccion <= 0 ||
      idArchivo <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message:
            'Los identificadores enviados no son válidos',
        },
      })
    }

    await removeFileFromCollection(
      idUsuario,
      idColeccion,
      idArchivo,
    )

    return res.status(200).json({
      success: true,
      message:
        'Archivo eliminado de la colección correctamente',
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'COLLECTION_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COLLECTION_NOT_FOUND',
          message:
            'La colección no fue encontrada',
        },
      })
    }

    if (
      error instanceof Error &&
      error.message ===
        'FILE_NOT_IN_COLLECTION'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code:
            'FILE_NOT_IN_COLLECTION',
          message:
            'El archivo no pertenece a esta colección',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible quitar el archivo de la colección',
      },
    })
  }
}

export async function listCollectionFilesController(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    const idUsuario = req.user?.id_usuario
    const idColeccion = Number(req.params.id)

    if (!idUsuario) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuario no autenticado',
        },
      })
    }

    if (
      !Number.isInteger(idColeccion) ||
      idColeccion <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COLLECTION_ID',
          message:
            'El identificador de la colección no es válido',
        },
      })
    }

    const files =
      await getCollectionFiles(
        idUsuario,
        idColeccion,
      )

    return res.status(200).json({
      success: true,
      data: {
        files,
      },
    })
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        'COLLECTION_NOT_FOUND'
    ) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COLLECTION_NOT_FOUND',
          message:
            'La colección no fue encontrada',
        },
      })
    }

    console.error(error)

    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'No fue posible obtener los archivos de la colección',
      },
    })
  }
}