import fs from 'node:fs/promises'

import Archivo from './file.model.js'

import Publicacion from '../publications/publication.model.js'
import PublicacionDestinatario from '../publications/publication-recipient.model.js'

interface CreateFileInput {
  idUsuario: number
  nombreOriginal: string
  rutaAlmacenamiento: string
  mimeType: string
  tamanoBytes: number
}

export async function createFile(
  data: CreateFileInput,
) {
  return Archivo.create({
    id_usuario: data.idUsuario,
    nombre_original:
      data.nombreOriginal,
    ruta_almacenamiento:
      data.rutaAlmacenamiento,
    tipo_mime:
      data.mimeType,
    tamano_bytes:
      data.tamanoBytes,
  })
}

/*
 * ============================================================
 * ARCHIVOS DEL PROPIETARIO
 * ============================================================
 */
export async function getUserFiles(
  idUsuario: number,
) {
  return Archivo.findAll({
    where: {
      id_usuario:
        idUsuario,
    },

    order: [
      [
        'fecha_subida',
        'DESC',
      ],
    ],
  })
}

export async function getUserFileById(
  idUsuario: number,
  idArchivo: number,
) {
  return Archivo.findOne({
    where: {
      id_archivo:
        idArchivo,

      id_usuario:
        idUsuario,
    },
  })
}

/*
 * ============================================================
 * ARCHIVO ACCESIBLE
 * ============================================================
 *
 * Permite obtener un archivo cuando:
 *
 * 1. El usuario es propietario.
 * 2. El archivo tiene una publicación pública.
 * 3. El archivo tiene una publicación dirigida
 *    y el usuario es destinatario.
 *
 * Una publicación privada solamente puede
 * ser visualizada por el propietario.
 * ============================================================
 */
export async function getAccessibleFileById(
  idUsuario: number,
  idArchivo: number,
) {
  /*
   * Primero buscamos el archivo.
   */
  const file =
    await Archivo.findByPk(
      idArchivo,
    )

  if (!file) {
    return null
  }

  /*
   * El propietario siempre puede
   * acceder a su propio archivo.
   */
  if (
    file.id_usuario ===
    idUsuario
  ) {
    return file
  }

  /*
   * Si el archivo fue restringido
   * administrativamente, ningún
   * tercero puede visualizarlo.
   */
  if (
    file.estado ===
    'restringido'
  ) {
    return null
  }

  /*
   * Buscar publicación activa
   * correspondiente al archivo.
   */
  const publication =
    await Publicacion.findOne({
      where: {
        id_archivo:
          idArchivo,

        tipo_contenido:
          'archivo',

        esta_activa:
          true,
      },
    })

  if (!publication) {
    return null
  }

  /*
   * PUBLICACIÓN PÚBLICA
   */
  if (
    publication.alcance ===
    'publica'
  ) {
    return file
  }

  /*
   * PUBLICACIÓN PRIVADA
   *
   * Como ya verificamos arriba
   * que no es el propietario,
   * no tiene acceso.
   */
  if (
    publication.alcance ===
    'privada'
  ) {
    return null
  }

  /*
   * PUBLICACIÓN DIRIGIDA
   */
  const recipient =
    await PublicacionDestinatario.findOne(
      {
        where: {
          id_publicacion:
            publication.id_publicacion,

          id_usuario:
            idUsuario,
        },
      },
    )

  if (!recipient) {
    return null
  }

  return file
}

/*
 * ============================================================
 * ELIMINAR ARCHIVO
 * ============================================================
 */
export async function deleteUserFile(
  idUsuario: number,
  idArchivo: number,
) {
  const file =
    await getUserFileById(
      idUsuario,
      idArchivo,
    )

  if (!file) {
    throw new Error(
      'FILE_NOT_FOUND',
    )
  }

  try {
    await fs.unlink(
      file.ruta_almacenamiento,
    )
  } catch {
    /*
     * Si el archivo físico
     * ya no existe, se elimina
     * igualmente el registro.
     */
  }

  await file.destroy()
}

/*
 * ============================================================
 * CONTADOR DE DESCARGAS
 * ============================================================
 */
export async function incrementDownloadCount(
  file: Archivo,
) {
  const currentDownloads =
    Number(
      file.contador_descargas ??
        0,
    )

  file.contador_descargas =
    currentDownloads + 1

  await file.save()
}