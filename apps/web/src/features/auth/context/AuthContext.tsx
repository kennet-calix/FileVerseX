import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  getMeRequest,
  loginRequest,
  type AuthUser,
} from '../services/auth.service'

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>

  logout: () => void

  updateUser: (
    updatedUser: AuthUser,
  ) => void
}

export const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined,
  )

interface AuthProviderProps {
  children: ReactNode
}

function clearStoredSession() {
  localStorage.removeItem(
    'fileversex_token',
  )

  localStorage.removeItem(
    'fileversex_user',
  )

  sessionStorage.removeItem(
    'fileversex_token',
  )

  sessionStorage.removeItem(
    'fileversex_user',
  )
}

function getStoredToken() {
  return (
    localStorage.getItem(
      'fileversex_token',
    ) ??
    sessionStorage.getItem(
      'fileversex_token',
    )
  )
}

function getActiveStorage() {
  const localToken =
    localStorage.getItem(
      'fileversex_token',
    )

  if (localToken) {
    return localStorage
  }

  return sessionStorage
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<AuthUser | null>(null)

  const [token, setToken] =
    useState<string | null>(
      getStoredToken,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  useEffect(() => {
    async function restoreSession() {
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return
      }

      try {
        const currentUser =
          await getMeRequest(
            token,
          )

        setUser(currentUser)

        const storage =
          getActiveStorage()

        storage.setItem(
          'fileversex_user',
          JSON.stringify(
            currentUser,
          ),
        )
      } catch {
        clearStoredSession()

        setToken(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    restoreSession()
  }, [token])

  async function login(
    email: string,
    password: string,
    rememberMe = false,
  ) {
    const response =
      await loginRequest(
        email,
        password,
      )

    const newToken =
      response.data.token

    const newUser =
      response.data.user

    /*
      Eliminamos cualquier sesión
      anterior antes de guardar
      la nueva.
    */
    clearStoredSession()

    /*
      rememberMe = true:
      localStorage

      rememberMe = false:
      sessionStorage
    */
    const storage =
      rememberMe
        ? localStorage
        : sessionStorage

    storage.setItem(
      'fileversex_token',
      newToken,
    )

    storage.setItem(
      'fileversex_user',
      JSON.stringify(
        newUser,
      ),
    )

    setToken(newToken)
    setUser(newUser)
  }

  function updateUser(
    updatedUser: AuthUser,
  ) {
    setUser(updatedUser)

    const storage =
      getActiveStorage()

    storage.setItem(
      'fileversex_user',
      JSON.stringify(
        updatedUser,
      ),
    )
  }

  function logout() {
    clearStoredSession()

    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated:
          Boolean(user && token),
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}