import Archivo from '../files/file.model.js'
import Coleccion from '../collections/collection.model.js'
import Usuario from '../user/user.model.js'

import Publicacion from '../publications/publication.model.js'
import Like from '../publications/like.model.js'
import Comentario from '../publications/comment.model.js'

export async function obtenerEstadisticasUsuario(
  id_usuario: number,
) {
  /*
   * ============================================================
   * ARCHIVOS DEL USUARIO
   * ============================================================
   */
  const archivos = await Archivo.findAll({
    where: {
      id_usuario,
    },
    order: [
      ['contador_descargas', 'DESC'],
    ],
  })

  const totalArchivos = archivos.length

  const totalDescargas = archivos.reduce(
    (total, archivo) =>
      total +
      Number(
        archivo.contador_descargas ?? 0,
      ),
    0,
  )

  /*
   * Archivo más descargado
   */
  const archivoMasDescargado =
    archivos.length > 0
      ? archivos[0]
      : null

  /*
   * ============================================================
   * PUBLICACIONES ACTIVAS DEL USUARIO
   * ============================================================
   */
  const publicaciones =
    await Publicacion.findAll({
      where: {
        id_usuario,
        esta_activa: true,
      },
      order: [
        [
          'fecha_actualizacion',
          'DESC',
        ],
      ],
    })

  const totalPublicaciones =
    publicaciones.length

  /*
   * Esta cantidad se mantiene separada
   * para mostrar cuántas publicaciones
   * del usuario son públicas.
   */
  const publicacionesPublicas =
    publicaciones.filter(
      (publication) =>
        publication.alcance ===
        'publica',
    )

  /*
   * ============================================================
   * LIKES Y COMENTARIOS
   * ============================================================
   *
   * Ahora se contabilizan las interacciones
   * de TODAS las publicaciones activas
   * pertenecientes al usuario:
   *
   * - públicas
   * - dirigidas
   * - privadas
   */
  let totalLikes = 0
  let totalComentarios = 0

  let publicacionMasLikes:
    {
      id_publicacion: number
      nombre_contenido: string
      total_likes: number
    } | null = null

  let publicacionMasComentarios:
    {
      id_publicacion: number
      nombre_contenido: string
      total_comentarios: number
    } | null = null

  /*
   * ============================================================
   * RECORRER TODAS LAS PUBLICACIONES ACTIVAS
   * ============================================================
   */
  for (const publication of publicaciones) {
    /*
     * Likes de esta publicación
     */
    const likes = await Like.count({
      where: {
        id_publicacion:
          publication.id_publicacion,
      },
    })

    /*
     * Comentarios de esta publicación
     */
    const comentarios =
      await Comentario.count({
        where: {
          id_publicacion:
            publication.id_publicacion,
        },
      })

    /*
     * Acumulamos las interacciones
     * recibidas por el usuario.
     */
    totalLikes += likes
    totalComentarios += comentarios

    /*
     * ==========================================================
     * OBTENER NOMBRE DEL CONTENIDO
     * ==========================================================
     */
    let nombreContenido =
      `Publicación #${publication.id_publicacion}`

    /*
     * Si la publicación corresponde
     * a un archivo.
     */
    if (
      publication.tipo_contenido ===
        'archivo' &&
      publication.id_archivo
    ) {
      const archivo =
        await Archivo.findByPk(
          publication.id_archivo,
        )

      if (archivo) {
        nombreContenido =
          archivo.nombre_original
      }
    }

    /*
     * Si la publicación corresponde
     * a una colección.
     */
    if (
      publication.tipo_contenido ===
        'coleccion' &&
      publication.id_coleccion
    ) {
      const coleccion =
        await Coleccion.findByPk(
          publication.id_coleccion,
        )

      if (coleccion) {
        nombreContenido =
          coleccion.nombre
      }
    }

    /*
     * ==========================================================
     * PUBLICACIÓN CON MÁS LIKES
     * ==========================================================
     */
    if (
      !publicacionMasLikes ||
      likes >
        publicacionMasLikes.total_likes
    ) {
      publicacionMasLikes = {
        id_publicacion:
          publication.id_publicacion,

        nombre_contenido:
          nombreContenido,

        total_likes:
          likes,
      }
    }

    /*
     * ==========================================================
     * PUBLICACIÓN CON MÁS COMENTARIOS
     * ==========================================================
     */
    if (
      !publicacionMasComentarios ||
      comentarios >
        publicacionMasComentarios
          .total_comentarios
    ) {
      publicacionMasComentarios = {
        id_publicacion:
          publication.id_publicacion,

        nombre_contenido:
          nombreContenido,

        total_comentarios:
          comentarios,
      }
    }
  }

  /*
   * ============================================================
   * USUARIO CON MÁS ARCHIVOS SUBIDOS
   * ============================================================
   */
  const todosLosArchivos =
    await Archivo.findAll({
      attributes: [
        'id_usuario',
      ],
    })

  const archivosPorUsuario =
    new Map<number, number>()

  for (const archivo of todosLosArchivos) {
    const idUsuarioArchivo =
      Number(archivo.id_usuario)

    const cantidadActual =
      archivosPorUsuario.get(
        idUsuarioArchivo,
      ) ?? 0

    archivosPorUsuario.set(
      idUsuarioArchivo,
      cantidadActual + 1,
    )
  }

  let idUsuarioMasArchivos:
    number | null = null

  let mayorCantidadArchivos = 0

  for (
    const [idUsuario, cantidad]
    of archivosPorUsuario
  ) {
    if (
      cantidad >
      mayorCantidadArchivos
    ) {
      mayorCantidadArchivos =
        cantidad

      idUsuarioMasArchivos =
        idUsuario
    }
  }

  let usuarioMasArchivos:
    {
      id_usuario: number
      nombre: string
      total_archivos: number
    } | null = null

  if (
    idUsuarioMasArchivos !== null
  ) {
    const usuario =
      await Usuario.findByPk(
        idUsuarioMasArchivos,
        {
          attributes: [
            'id_usuario',
            'nombre_completo',
          ],
        },
      )

    if (usuario) {
      usuarioMasArchivos = {
        id_usuario:
          usuario.id_usuario,

        nombre:
          usuario.nombre_completo,

        total_archivos:
          mayorCantidadArchivos,
      }
    }
  }

  /*
   * ============================================================
   * RESPUESTA
   * ============================================================
   */
  return {
    resumen: {
      total_archivos:
        totalArchivos,

      total_descargas:
        totalDescargas,

      total_publicaciones:
        totalPublicaciones,

      publicaciones_publicas:
        publicacionesPublicas.length,

      total_likes:
        totalLikes,

      total_comentarios:
        totalComentarios,
    },

    archivo_mas_descargado:
      archivoMasDescargado
        ? {
            id_archivo:
              archivoMasDescargado
                .id_archivo,

            nombre:
              archivoMasDescargado
                .nombre_original,

            descargas:
              Number(
                archivoMasDescargado
                  .contador_descargas ??
                  0,
              ),
          }
        : null,

    publicacion_mas_likes:
      publicacionMasLikes,

    publicacion_mas_comentarios:
      publicacionMasComentarios,

    usuario_mas_archivos:
      usuarioMasArchivos,
  }
}