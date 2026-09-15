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

export interface TraceabilityRecipient {
  id_usuario: number
  nombre_completo: string
  email: string
}

export interface TraceabilityItem {
  id_historial: number
  id_publicacion: number

  tipo_contenido:
    | 'archivo'
    | 'coleccion'
    | null

  id_contenido:
    | number
    | null

  nombre_contenido: string

  alcance_anterior:
    | 'publica'
    | 'dirigida'
    | 'privada'
    | null

  alcance_nuevo:
    | 'publica'
    | 'dirigida'
    | 'privada'

  destinatarios:
    TraceabilityRecipient[]

  likes_acumulados: number
  comentarios_acumulados: number
  fecha_cambio: string
}

export interface TraceabilitySummary {
  total_cambios: number
  publicaciones_con_historial: number
}

export interface TraceabilityReport {
  resumen: TraceabilitySummary
  historial: TraceabilityItem[]
}

interface ApiResponse {
  success: boolean
  data: TraceabilityReport
}

export async function getTraceabilityReportRequest(): Promise<TraceabilityReport> {
  const token = getToken()

  if (!token) {
    throw new Error(
      'No se encontró una sesión activa',
    )
  }

  const response =
    await fetch(
      `${API_URL}/reports/traceability`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const result =
    await response.json()

  if (!response.ok) {
    throw new Error(
      result?.error?.message ??
        'No fue posible obtener el reporte de trazabilidad',
    )
  }

  const data =
    result as ApiResponse

  return data.data
}