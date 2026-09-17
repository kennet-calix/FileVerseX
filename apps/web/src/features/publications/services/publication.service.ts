const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api/v1'

export type PublicationScope =
  | 'publica'
  | 'dirigida'
  | 'privada'

export type PublicationContentType =
  | 'archivo'
  | 'coleccion'

export interface PublicationAuthor {
  id_usuario: number
  nombre_completo: string
  email: string
  foto_perfil: string | null
}

export interface Publication {
  id_publicacion: number
  id_usuario: number
  tipo_contenido: PublicationContentType
  id_archivo: number | null
  id_coleccion: number | null
  alcance: PublicationScope
  esta_activa: boolean
  fecha_publicacion: string
  fecha_actualizacion: string
  nombre_contenido: string
  tipo_mime: string | null
  autor: PublicationAuthor | null
  total_likes: number
  total_comentarios: number
  usuario_dio_like: boolean
}

export interface PublicationRecipient {
  id_publicacion: number
  id_usuario: number
  fecha_asignacion: string
}

export interface CommentUser {
  id_usuario: number
  nombre_completo: string
  foto_perfil: string | null
}

export interface PublicationComment {
  id_comentario: number
  id_publicacion: number
  id_usuario: number
  contenido: string
  fecha_comentario: string
  usuario?: CommentUser | null
}

interface ApiErrorResponse {
  error?: {
    message?: string
  }
}

interface ApiResponse<T> {
  message?: string
  data: T
}

function getToken(): string {
  const token =
    localStorage.getItem('fileversex_token') ??
    sessionStorage.getItem('fileversex_token')

  if (!token) {
    throw new Error('No existe una sesión activa')
  }

  return token
}

async function getErrorMessage(
  response: Response,
  defaultMessage: string,
) {
  try {
    const data =
      (await response.json()) as ApiErrorResponse

    return data.error?.message ?? defaultMessage
  } catch {
    return defaultMessage
  }
}

export async function getPublicationsRequest(): Promise<Publication[]> {
  const token = getToken()
  const response = await fetch(`${API_URL}/publications`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible obtener las publicaciones',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<Publication[]>

  return result.data
}

export async function createPublicationRequest(
  tipoContenido: PublicationContentType,
  idContenido: number,
  alcance: PublicationScope,
  destinatarios: number[] = [],
): Promise<Publication> {
  const token = getToken()
  const response = await fetch(`${API_URL}/publications`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tipo_contenido: tipoContenido,
      id_contenido: idContenido,
      alcance,
      destinatarios,
    }),
  })

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible publicar el contenido',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<Publication>

  return result.data
}

export async function updatePublicationRequest(
  idPublicacion: number,
  alcance: PublicationScope,
  destinatarios: number[] = [],
): Promise<Publication> {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/publications/${idPublicacion}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alcance, destinatarios }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible actualizar la publicación',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<Publication>

  return result.data
}

export async function deactivatePublicationRequest(
  idPublicacion: number,
): Promise<Publication> {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/publications/${idPublicacion}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible desactivar la publicación',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<Publication>

  return result.data
}

export async function togglePublicationLikeRequest(
  idPublicacion: number,
): Promise<boolean> {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/publications/${idPublicacion}/like`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible actualizar el like',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<{ liked: boolean }>

  return result.data.liked
}

export async function getPublicationCommentsRequest(
  idPublicacion: number,
): Promise<PublicationComment[]> {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/publications/${idPublicacion}/comments`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible obtener los comentarios',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<PublicationComment[]>

  return result.data
}

export async function createPublicationCommentRequest(
  idPublicacion: number,
  contenido: string,
): Promise<PublicationComment> {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/publications/${idPublicacion}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contenido }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible agregar el comentario',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<PublicationComment>

  return result.data
}

export async function updatePublicationCommentRequest(
  idPublicacion: number,
  idComentario: number,
  contenido: string,
): Promise<PublicationComment> {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/publications/${idPublicacion}/comments/${idComentario}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contenido }),
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible editar el comentario',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<PublicationComment>

  return result.data
}

export async function deletePublicationCommentRequest(
  idPublicacion: number,
  idComentario: number,
): Promise<void> {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/publications/${idPublicacion}/comments/${idComentario}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible eliminar el comentario',
      ),
    )
  }
}

export async function getPublicationRecipientsRequest(
  idPublicacion: number,
): Promise<PublicationRecipient[]> {
  const token = getToken()
  const response = await fetch(
    `${API_URL}/publications/${idPublicacion}/recipients`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        'No fue posible obtener los destinatarios',
      ),
    )
  }

  const result =
    (await response.json()) as ApiResponse<PublicationRecipient[]>

  return result.data
}
