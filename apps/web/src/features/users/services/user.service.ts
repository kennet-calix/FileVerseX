const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3000/api/v1'

export interface AvailableUser {
  id_usuario: number
  nombre_completo: string
  email: string
  foto_perfil: string | null
  id_rol: number
}

interface UsersResponse {
  success: boolean
  data: {
    users: AvailableUser[]
  }
}

interface ApiErrorResponse {
  error?: {
    message?: string
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

export async function getAvailableUsersRequest(): Promise<
  AvailableUser[]
> {
  const token = getToken()

  const response = await fetch(
    `${API_URL}/users`,
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
      'No fue posible obtener los usuarios'

    try {
      const errorData =
        (await response.json()) as
          ApiErrorResponse

      message =
        errorData.error?.message ??
        message
    } catch {
      // Se mantiene el mensaje por defecto
    }

    throw new Error(message)
  }

  const result =
    (await response.json()) as
      UsersResponse

  return result.data.users
}