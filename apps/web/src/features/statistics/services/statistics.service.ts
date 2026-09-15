const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api/v1'

function getToken() {
  return (
    localStorage.getItem(
      'fileversex_token',
    ) ??
    sessionStorage.getItem(
      'fileversex_token',
    )
  )
}

export interface StatisticsSummary {
  total_archivos: number
  total_descargas: number
  total_publicaciones: number
  publicaciones_publicas: number
  total_likes: number
  total_comentarios: number
}

export interface MostDownloadedFile {
  id_archivo: number
  nombre: string
  descargas: number
}

export interface MostLikedPublication {
  id_publicacion: number
  nombre_contenido: string
  total_likes: number
}

export interface MostCommentedPublication {
  id_publicacion: number
  nombre_contenido: string
  total_comentarios: number
}

export interface UserWithMostFiles {
  id_usuario: number
  nombre: string
  total_archivos: number
}

export interface UserStatistics {
  resumen: StatisticsSummary

  archivo_mas_descargado:
    | MostDownloadedFile
    | null

  publicacion_mas_likes:
    | MostLikedPublication
    | null

  publicacion_mas_comentarios:
    | MostCommentedPublication
    | null

  usuario_mas_archivos:
    | UserWithMostFiles
    | null
}

interface ApiResponse {
  data: UserStatistics
}

export async function getMyStatisticsRequest(): Promise<UserStatistics> {
  const token = getToken()

  if (!token) {
    throw new Error(
      'No se encontró una sesión activa',
    )
  }

  const response =
    await fetch(
      `${API_URL}/statistics/me`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const result =
    (await response.json()) as
      | ApiResponse
      | {
          error?: {
            message?: string
          }
        }

  if (!response.ok) {
    throw new Error(
      'error' in result
        ? result.error?.message ??
            'No fue posible obtener las estadísticas'
        : 'No fue posible obtener las estadísticas',
    )
  }

  if (!('data' in result)) {
    throw new Error(
      'Respuesta inválida del servidor',
    )
  }

  return result.data
}