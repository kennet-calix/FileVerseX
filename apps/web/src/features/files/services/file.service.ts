const API_URL = 'http://localhost:3000/api/v1'

export interface FileItem {
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

interface FileListResponse {
  success: true
  data: {
    files: FileItem[]
  }
}

interface FileUploadResponse {
  success: true
  message: string
  data: {
    file: FileItem
  }
}

function getToken(): string {
  const token =
    localStorage.getItem(
      'fileversex_token',
    ) ??
    sessionStorage.getItem(
      'fileversex_token',
    )

  if (!token) {
    throw new Error(
      'No existe una sesión activa',
    )
  }

  return token
}

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  let data: unknown

  try {
    data = await response.json()
  } catch {
    throw new Error(
      'El servidor devolvió una respuesta no válida',
    )
  }

  if (!response.ok) {
    const errorData =
      data as ApiErrorResponse

    throw new Error(
      errorData?.error?.message ??
        'Ocurrió un error inesperado',
    )
  }

  return data as T
}

export async function getFilesRequest(): Promise<FileItem[]> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/files`,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const data =
    await parseResponse<FileListResponse>(
      response,
    )

  return data.data.files
}

export async function uploadFileRequest(
  file: File,
): Promise<FileItem> {
  const token =
    getToken()

  const formData =
    new FormData()

  formData.append(
    'file',
    file,
  )

  const response =
    await fetch(
      `${API_URL}/files/upload`,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },

        body: formData,
      },
    )

  const data =
    await parseResponse<FileUploadResponse>(
      response,
    )

  return data.data.file
}

export function uploadFileWithProgress(
  file: File,
  onProgress: (
    progress: number,
  ) => void,
): Promise<FileItem> {
  return new Promise(
    (resolve, reject) => {
      let token: string

      try {
        token =
          getToken()
      } catch (error) {
        reject(error)
        return
      }

      const xhr =
        new XMLHttpRequest()

      const formData =
        new FormData()

      formData.append(
        'file',
        file,
      )

      xhr.open(
        'POST',
        `${API_URL}/files/upload`,
      )

      xhr.setRequestHeader(
        'Authorization',
        `Bearer ${token}`,
      )

      xhr.upload.onprogress =
        (event) => {
          if (
            !event.lengthComputable
          ) {
            return
          }

          const progress =
            Math.round(
              (event.loaded /
                event.total) *
                100,
            )

          onProgress(
            progress,
          )
        }

      xhr.onload = () => {
        try {
          const data =
            JSON.parse(
              xhr.responseText,
            ) as
              | FileUploadResponse
              | ApiErrorResponse

          if (
            xhr.status >= 200 &&
            xhr.status < 300 &&
            'data' in data
          ) {
            onProgress(100)

            resolve(
              data.data.file,
            )

            return
          }

          if (
            'error' in data
          ) {
            reject(
              new Error(
                data.error
                  .message,
              ),
            )

            return
          }

          reject(
            new Error(
              'No fue posible cargar el archivo',
            ),
          )
        } catch {
          reject(
            new Error(
              'No fue posible procesar la respuesta del servidor',
            ),
          )
        }
      }

      xhr.onerror = () => {
        reject(
          new Error(
            'No fue posible conectar con el servidor',
          ),
        )
      }

      xhr.send(
        formData,
      )
    },
  )
}

export async function downloadFileRequest(
  idArchivo: number,
  nombreArchivo: string,
): Promise<void> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/files/${idArchivo}/download`,
      {
        method: 'GET',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  if (!response.ok) {
    let message =
      'No fue posible descargar el archivo'

    try {
      const data =
        (await response.json()) as ApiErrorResponse

      message =
        data?.error?.message ??
        message
    } catch {
      // Se mantiene el mensaje genérico.
    }

    throw new Error(
      message,
    )
  }

  const blob =
    await response.blob()

  const url =
    URL.createObjectURL(
      blob,
    )

  const link =
    document.createElement(
      'a',
    )

  link.href = url
  link.download =
    nombreArchivo

  document.body.appendChild(
    link,
  )

  link.click()
  link.remove()

  URL.revokeObjectURL(
    url,
  )
}

export async function deleteFileRequest(
  idArchivo: number,
): Promise<void> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/files/${idArchivo}`,
      {
        method: 'DELETE',

        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  await parseResponse<{
    success: true
    message: string
  }>(response)
}
export async function previewFileRequest(
  idArchivo: number,
): Promise<Blob> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/files/${idArchivo}/preview`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    let message =
      'No fue posible visualizar el archivo'

    try {
      const data =
        (await response.json()) as ApiErrorResponse

      message =
        data?.error?.message ??
        message
    } catch {
      // Conservamos el mensaje genérico.
    }

    throw new Error(message)
  }

  return response.blob()
}