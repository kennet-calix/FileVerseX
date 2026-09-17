const API_URL = 'http://localhost:3000/api/v1'

export interface AuthUser {
  id_usuario: number
  nombre_completo: string
  email: string
  descripcion: string | null
  foto_perfil: string | null
  id_rol: number
  esta_bloqueado: boolean | null
  fecha_registro?: string | null
}

interface LoginResponse {
  success: boolean
  message: string
  data: {
    user: AuthUser
    token: string
  }
}

interface RegisterResponse {
  success: boolean
  message: string
  data: {
    user: AuthUser
  }
}

interface UserResponse {
  success: boolean
  message?: string
  data: {
    user: AuthUser
  }
}

interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
  }
}

export interface ForgotPasswordResponse {
  success: boolean
  message: string
  data?: {
    resetToken: string
  }
}

export interface ResetPasswordResponse {
  success: boolean
  message: string
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

/*
  Busca el token tanto en una sesión
  persistente como en una sesión temporal.
*/
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

/*
  INICIAR SESIÓN
*/
export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    },
  )

  return parseResponse<LoginResponse>(
    response,
  )
}

/*
  REGISTRAR USUARIO
*/
export async function registerRequest(
  nombreCompleto: string,
  email: string,
  password: string,
  descripcion: string,
): Promise<RegisterResponse> {
  const response = await fetch(
    `${API_URL}/auth/register`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        nombreCompleto,
        email,
        password,
        descripcion,
      }),
    },
  )

  return parseResponse<RegisterResponse>(
    response,
  )
}

/*
  OBTENER USUARIO ACTUAL
*/
export async function getMeRequest(
  token?: string,
): Promise<AuthUser> {
  const authToken =
    token ?? getToken()

  const response = await fetch(
    `${API_URL}/users/me`,
    {
      method: 'GET',

      headers: {
        Authorization:
          `Bearer ${authToken}`,
      },
    },
  )

  const data =
    await parseResponse<UserResponse>(
      response,
    )

  return data.data.user
}

/*
  ACTUALIZAR INFORMACIÓN
  DEL PERFIL
*/
export async function updateMyProfileRequest(
  nombreCompleto: string,
  descripcion: string,
): Promise<AuthUser> {
  const token =
    getToken()

  const response = await fetch(
    `${API_URL}/users/me`,
    {
      method: 'PUT',

      headers: {
        'Content-Type':
          'application/json',

        Authorization:
          `Bearer ${token}`,
      },

      body: JSON.stringify({
        nombreCompleto,
        descripcion,
      }),
    },
  )

  const data =
    await parseResponse<UserResponse>(
      response,
    )

  return data.data.user
}

/*
  ACTUALIZAR FOTO
  DE PERFIL
*/
export async function updateMyProfilePhotoRequest(
  photo: File,
): Promise<AuthUser> {
  const token =
    getToken()

  const formData =
    new FormData()

  formData.append(
    'photo',
    photo,
  )

  const response = await fetch(
    `${API_URL}/users/me/photo`,
    {
      method: 'PUT',

      headers: {
        Authorization:
          `Bearer ${token}`,
      },

      body: formData,
    },
  )

  const data =
    await parseResponse<UserResponse>(
      response,
    )

  return data.data.user
}

/*
  SOLICITAR RECUPERACIÓN
  DE CONTRASEÑA
*/
export async function forgotPasswordRequest(
  email: string,
): Promise<ForgotPasswordResponse> {
  const response = await fetch(
    `${API_URL}/auth/forgot-password`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        email,
      }),
    },
  )

  return parseResponse<ForgotPasswordResponse>(
    response,
  )
}

/*
  RESTABLECER CONTRASEÑA
*/
export async function resetPasswordRequest(
  token: string,
  password: string,
): Promise<ResetPasswordResponse> {
  const response = await fetch(
    `${API_URL}/auth/reset-password`,
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/json',
      },

      body: JSON.stringify({
        token,
        password,
      }),
    },
  )

  return parseResponse<ResetPasswordResponse>(
    response,
  )
}