const API_URL = 'http://localhost:3000/api/v1'

export interface CollectionItem {
  id_coleccion: number
  id_usuario: number
  nombre: string
  descripcion: string | null
  fecha_creacion: string | null
}

export interface CollectionFileItem {
  id_archivo: number
  id_usuario: number
  nombre_original: string
  ruta_almacenamiento: string
  tipo_mime: string
  tamano_bytes: number
  contador_descargas: number | null
  estado: 'activo' | 'restringido'
  fecha_subida: string | null
}

interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

interface CollectionListResponse {
  success: true
  data: {
    collections: CollectionItem[]
  }
}

interface CollectionResponse {
  success: true
  message: string
  data: {
    collection: CollectionItem
  }
}

interface SingleCollectionResponse {
  success: true
  data: {
    collection: CollectionItem
  }
}

interface CollectionFilesResponse {
  success: true
  data: {
    files: CollectionFileItem[]
  }
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

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const data = await response.json()

  if (!response.ok) {
    const errorData = data as ApiErrorResponse

    throw new Error(
      errorData?.error?.message ??
        'Ocurrió un error inesperado',
    )
  }

  return data as T
}

export async function getCollectionsRequest(): Promise<
  CollectionItem[]
> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/collections`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  const data =
    await parseResponse<CollectionListResponse>(
      response,
    )

  return data.data.collections
}

export async function getCollectionByIdRequest(
  idColeccion: number,
): Promise<CollectionItem> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/collections/${idColeccion}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  const data =
    await parseResponse<SingleCollectionResponse>(
      response,
    )

  return data.data.collection
}

export async function createCollectionRequest(
  nombre: string,
  descripcion: string,
): Promise<CollectionItem> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/collections`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre,
        descripcion,
      }),
    },
  )

  const data =
    await parseResponse<CollectionResponse>(
      response,
    )

  return data.data.collection
}

export async function updateCollectionRequest(
  idColeccion: number,
  nombre: string,
  descripcion: string,
): Promise<CollectionItem> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/collections/${idColeccion}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nombre,
        descripcion,
      }),
    },
  )

  const data =
    await parseResponse<CollectionResponse>(
      response,
    )

  return data.data.collection
}

export async function deleteCollectionRequest(
  idColeccion: number,
): Promise<void> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/collections/${idColeccion}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  await parseResponse<{
    success: true
    message: string
  }>(response)
}

export async function getCollectionFilesRequest(
  idColeccion: number,
): Promise<CollectionFileItem[]> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/collections/${idColeccion}/files`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  const data =
    await parseResponse<CollectionFilesResponse>(
      response,
    )

  return data.data.files
}

export async function addFileToCollectionRequest(
  idColeccion: number,
  idArchivo: number,
): Promise<void> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/collections/${idColeccion}/files/${idArchivo}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  await parseResponse<{
    success: true
    message: string
  }>(response)
}

export async function removeFileFromCollectionRequest(
  idColeccion: number,
  idArchivo: number,
): Promise<void> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/collections/${idColeccion}/files/${idArchivo}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  await parseResponse<{
    success: true
    message: string
  }>(response)
}