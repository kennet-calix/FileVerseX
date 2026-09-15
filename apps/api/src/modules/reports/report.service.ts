import Archivo from '../files/file.model.js'
import Coleccion from '../collections/collection.model.js'
import Usuario from '../user/user.model.js'

import Publicacion from '../publications/publication.model.js'
import HistorialPublicacion from '../publications/publication-history.model.js'

interface RecipientInfo {
  id_usuario: number
  nombre_completo: string
  email: string
}

export async function obtenerReporteTrazabilidad(
  id_usuario: number,
) {
  /*
   * ============================================================
   * OBTENER HISTORIAL DEL USUARIO
   * ============================================================
   */
  const historial =
    await HistorialPublicacion.findAll({
      where: {
        id_usuario,
      },

      order: [
        [
          'fecha_cambio',
          'DESC',
        ],
        [
          'id_historial',
          'DESC',
        ],
      ],
    })

  const resultado = []

  /*
   * ============================================================
   * ENRIQUECER CADA REGISTRO
   * ============================================================
   */
  for (
    const registro
    of historial
  ) {
    /*
     * Obtener publicación relacionada.
     */
    const publicacion =
      await Publicacion.findByPk(
        registro.id_publicacion,
      )

    /*
     * Si por alguna razón ya no existe
     * la publicación, conservamos
     * igualmente el registro histórico.
     */
    let tipoContenido:
      | 'archivo'
      | 'coleccion'
      | null = null

    let idContenido:
      number | null = null

    let nombreContenido =
      'Contenido no disponible'

    if (publicacion) {
      tipoContenido =
        publicacion.tipo_contenido

      /*
       * ========================================================
       * ARCHIVO
       * ========================================================
       */
      if (
        publicacion.tipo_contenido ===
          'archivo' &&
        publicacion.id_archivo
      ) {
        idContenido =
          publicacion.id_archivo

        const archivo =
          await Archivo.findByPk(
            publicacion.id_archivo,
          )

        if (archivo) {
          nombreContenido =
            archivo.nombre_original
        } else {
          nombreContenido =
            `Archivo #${publicacion.id_archivo}`
        }
      }

      /*
       * ========================================================
       * COLECCIÓN
       * ========================================================
       */
      if (
        publicacion.tipo_contenido ===
          'coleccion' &&
        publicacion.id_coleccion
      ) {
        idContenido =
          publicacion.id_coleccion

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
    }

    /*
     * ============================================================
     * DESTINATARIOS DEL SNAPSHOT
     * ============================================================
     */
    const snapshot =
      Array.isArray(
        registro.destinatarios_snapshot,
      )
        ? registro.destinatarios_snapshot
        : []

    const destinatarios:
      RecipientInfo[] = []

    for (
      const idDestinatario
      of snapshot
    ) {
      const usuario =
        await Usuario.findByPk(
          Number(
            idDestinatario,
          ),
          {
            attributes: [
              'id_usuario',
              'nombre_completo',
              'email',
            ],
          },
        )

      if (usuario) {
        destinatarios.push({
          id_usuario:
            usuario.id_usuario,

          nombre_completo:
            usuario.nombre_completo,

          email:
            usuario.email,
        })
      }
    }

    resultado.push({
      id_historial:
        registro.id_historial,

      id_publicacion:
        registro.id_publicacion,

      tipo_contenido:
        tipoContenido,

      id_contenido:
        idContenido,

      nombre_contenido:
        nombreContenido,

      alcance_anterior:
        registro.alcance_anterior,

      alcance_nuevo:
        registro.alcance_nuevo,

      destinatarios,

      likes_acumulados:
        Number(
          registro.likes_acumulados ??
            0,
        ),

      comentarios_acumulados:
        Number(
          registro.comentarios_acumulados ??
            0,
        ),

      fecha_cambio:
        registro.fecha_cambio,
    })
  }

  /*
   * ============================================================
   * RESUMEN
   * ============================================================
   */
  const publicacionesUnicas =
    new Set(
      resultado.map(
        (item) =>
          item.id_publicacion,
      ),
    )

  return {
    resumen: {
      total_cambios:
        resultado.length,

      publicaciones_con_historial:
        publicacionesUnicas.size,
    },

    historial:
      resultado,
  }
}