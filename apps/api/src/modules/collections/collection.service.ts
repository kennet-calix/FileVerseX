import Coleccion from './collection.model.js'
import ColeccionArchivo from './collection-file.model.js'
import Archivo from '../files/file.model.js'

interface CreateCollectionInput {
  idUsuario: number
  nombre: string
  descripcion?: string | null
}

export async function createCollection(
  data: CreateCollectionInput,
) {
  return Coleccion.create({
    id_usuario: data.idUsuario,
    nombre: data.nombre.trim(),
    descripcion: data.descripcion?.trim() || null,
  })
}

export async function getUserCollections(
  idUsuario: number,
) {
  return Coleccion.findAll({
    where: {
      id_usuario: idUsuario,
    },
    order: [['fecha_creacion', 'DESC']],
  })
}

export async function getUserCollectionById(
  idUsuario: number,
  idColeccion: number,
) {
  return Coleccion.findOne({
    where: {
      id_coleccion: idColeccion,
      id_usuario: idUsuario,
    },
  })
}

export async function updateCollection(
  idUsuario: number,
  idColeccion: number,
  nombre: string,
  descripcion?: string | null,
) {
  const collection =
    await getUserCollectionById(
      idUsuario,
      idColeccion,
    )

  if (!collection) {
    throw new Error('COLLECTION_NOT_FOUND')
  }

  collection.nombre = nombre.trim()
  collection.descripcion =
    descripcion?.trim() || null

  await collection.save()

  return collection
}

export async function deleteCollection(
  idUsuario: number,
  idColeccion: number,
) {
  const collection =
    await getUserCollectionById(
      idUsuario,
      idColeccion,
    )

  if (!collection) {
    throw new Error('COLLECTION_NOT_FOUND')
  }

  await collection.destroy()
}

export async function addFileToCollection(
  idUsuario: number,
  idColeccion: number,
  idArchivo: number,
) {
  const collection =
    await getUserCollectionById(
      idUsuario,
      idColeccion,
    )

  if (!collection) {
    throw new Error('COLLECTION_NOT_FOUND')
  }

  const file = await Archivo.findOne({
    where: {
      id_archivo: idArchivo,
      id_usuario: idUsuario,
    },
  })

  if (!file) {
    throw new Error('FILE_NOT_FOUND')
  }

  const existingRelation =
    await ColeccionArchivo.findOne({
      where: {
        id_coleccion: idColeccion,
        id_archivo: idArchivo,
      },
    })

  if (existingRelation) {
    throw new Error(
      'FILE_ALREADY_IN_COLLECTION',
    )
  }

  return ColeccionArchivo.create({
    id_coleccion: idColeccion,
    id_archivo: idArchivo,
  })
}

export async function removeFileFromCollection(
  idUsuario: number,
  idColeccion: number,
  idArchivo: number,
) {
  const collection =
    await getUserCollectionById(
      idUsuario,
      idColeccion,
    )

  if (!collection) {
    throw new Error('COLLECTION_NOT_FOUND')
  }

  const relation =
    await ColeccionArchivo.findOne({
      where: {
        id_coleccion: idColeccion,
        id_archivo: idArchivo,
      },
    })

  if (!relation) {
    throw new Error(
      'FILE_NOT_IN_COLLECTION',
    )
  }

  await relation.destroy()
}

export async function getCollectionFiles(
  idUsuario: number,
  idColeccion: number,
) {
  const collection =
    await getUserCollectionById(
      idUsuario,
      idColeccion,
    )

  if (!collection) {
    throw new Error('COLLECTION_NOT_FOUND')
  }

  const relations =
    await ColeccionArchivo.findAll({
      where: {
        id_coleccion: idColeccion,
      },
      order: [['fecha_agregado', 'DESC']],
    })

  const fileIds = relations.map(
    (relation) => relation.id_archivo,
  )

  if (fileIds.length === 0) {
    return []
  }

  const files = await Archivo.findAll({
    where: {
      id_archivo: fileIds,
      id_usuario: idUsuario,
    },
  })

  return files
}