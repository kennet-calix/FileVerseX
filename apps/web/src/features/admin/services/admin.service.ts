const API_URL = 'http://localhost:3000/api/v1'

export interface AdminStats {
  totalUsuarios: number
  usuariosBloqueados: number
  totalArchivos: number
  archivosRestringidos: number
}

export interface AdminUser {
  id_usuario: number
  nombre_completo: string
  email: string
  descripcion: string | null
  foto_perfil: string | null
  id_rol: number
  esta_bloqueado: boolean | null
  fecha_registro: string | null
}

export interface AdminFile {
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

interface StatsResponse {
  success: true
  data: {
    stats: AdminStats
  }
}

interface UsersResponse {
  success: true
  data: {
    users: AdminUser[]
  }
}

interface UserResponse {
  success: true
  message?: string
  data: {
    user: AdminUser
  }
}

interface FilesResponse {
  success: true
  data: {
    files: AdminFile[]
  }
}

interface FileResponse {
  success: true
  message?: string
  data: {
    file: AdminFile
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

export async function getAdminStatsRequest(): Promise<AdminStats> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/admin/stats`,
      {
        method: 'GET',
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const data =
    await parseResponse<StatsResponse>(
      response,
    )

  return data.data.stats
}

export async function getAdminUsersRequest(): Promise<
  AdminUser[]
> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/admin/users`,
      {
        method: 'GET',
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const data =
    await parseResponse<UsersResponse>(
      response,
    )

  return data.data.users
}

export async function blockUserRequest(
  idUsuario: number,
): Promise<AdminUser> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/admin/users/${idUsuario}/block`,
      {
        method: 'PATCH',
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const data =
    await parseResponse<UserResponse>(
      response,
    )

  return data.data.user
}

export async function unblockUserRequest(
  idUsuario: number,
): Promise<AdminUser> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/admin/users/${idUsuario}/unblock`,
      {
        method: 'PATCH',
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const data =
    await parseResponse<UserResponse>(
      response,
    )

  return data.data.user
}

export async function getAdminFilesRequest(): Promise<
  AdminFile[]
> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/admin/files`,
      {
        method: 'GET',
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const data =
    await parseResponse<FilesResponse>(
      response,
    )

  return data.data.files
}

export async function restrictFileRequest(
  idArchivo: number,
): Promise<AdminFile> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/admin/files/${idArchivo}/restrict`,
      {
        method: 'PATCH',
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const data =
    await parseResponse<FileResponse>(
      response,
    )

  return data.data.file
}

export async function activateFileRequest(
  idArchivo: number,
): Promise<AdminFile> {
  const token =
    getToken()

  const response =
    await fetch(
      `${API_URL}/admin/files/${idArchivo}/activate`,
      {
        method: 'PATCH',
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    )

  const data =
    await parseResponse<FileResponse>(
      response,
    )

  return data.data.file
}