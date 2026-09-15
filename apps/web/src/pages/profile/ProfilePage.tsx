import {
  useEffect,
  useState,
} from 'react'

import {
  CheckCircle2,
  Mail,
  Save,
  ShieldCheck,
  User,
  X,
  XCircle,
} from 'lucide-react'

import {
  getMeRequest,
  updateMyProfileRequest,
  type AuthUser,
} from '../../features/auth/services/auth.service'

import { useAuth } from '../../features/auth/hooks/useAuth'

type ToastType =
  | 'success'
  | 'error'

interface ToastState {
  message: string
  type: ToastType
}

function ProfilePage() {
  const { updateUser } = useAuth()

  const [user, setUser] =
    useState<AuthUser | null>(null)

  const [nombre, setNombre] =
    useState('')

  const [
    descripcion,
    setDescripcion,
  ] = useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [toast, setToast] =
    useState<ToastState | null>(
      null,
    )

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeout =
      window.setTimeout(() => {
        setToast(null)
      }, 3500)

    return () => {
      window.clearTimeout(
        timeout,
      )
    }
  }, [toast])

  function showToast(
    message: string,
    type: ToastType,
  ) {
    setToast({
      message,
      type,
    })
  }

  async function loadProfile() {
    setIsLoading(true)

    try {
      const currentUser =
        await getMeRequest()

      setUser(currentUser)

      setNombre(
        currentUser.nombre_completo,
      )

      setDescripcion(
        currentUser.descripcion ?? '',
      )
    } catch (error) {
      if (
        error instanceof Error
      ) {
        showToast(
          error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible cargar el perfil',
          'error',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    const cleanName =
      nombre.trim()

    const cleanDescription =
      descripcion.trim()

    if (
      cleanName.length < 3
    ) {
      showToast(
        'El nombre debe contener al menos 3 caracteres',
        'error',
      )

      return
    }

    if (
      cleanName.length > 150
    ) {
      showToast(
        'El nombre no puede superar 150 caracteres',
        'error',
      )

      return
    }

    if (
      cleanDescription.length > 250
    ) {
      showToast(
        'La descripción no puede superar 250 caracteres',
        'error',
      )

      return
    }

    setIsSaving(true)

    try {
      const updatedUser =
        await updateMyProfileRequest(
          cleanName,
          cleanDescription,
        )

      // Actualiza esta página
      setUser(updatedUser)

      // Actualiza todo el sistema:
      // header, sidebar y cualquier componente
      // que utilice AuthContext.
      updateUser(updatedUser)

      setNombre(
        updatedUser.nombre_completo,
      )

      setDescripcion(
        updatedUser.descripcion ?? '',
      )

      showToast(
        'Perfil actualizado correctamente',
        'success',
      )
    } catch (error) {
      if (
        error instanceof Error
      ) {
        showToast(
          error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible actualizar el perfil',
          'error',
        )
      }
    } finally {
      setIsSaving(false)
    }
  }

  function formatDate(
    date?: string | null,
  ) {
    if (!date) {
      return 'Sin fecha'
    }

    return new Intl.DateTimeFormat(
      'es-HN',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    ).format(
      new Date(date),
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Cargando perfil...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        No fue posible cargar la información del usuario.
      </div>
    )
  }

  return (
    <div className="relative space-y-6">
      {/* TOAST */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 w-full max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-2xl border bg-white px-4 py-4 shadow-xl ${
              toast.type ===
              'success'
                ? 'border-emerald-200 text-emerald-700'
                : 'border-red-200 text-red-700'
            }`}
          >
            {toast.type ===
            'success' ? (
              <CheckCircle2
                size={21}
                className="mt-0.5 shrink-0"
              />
            ) : (
              <XCircle
                size={21}
                className="mt-0.5 shrink-0"
              />
            )}

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {toast.type ===
                'success'
                  ? 'Operación completada'
                  : 'Ocurrió un problema'}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setToast(null)
              }
              className="text-slate-400 transition hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ENCABEZADO */}
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Cuenta
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Mi perfil
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Administra tu información personal y los datos de tu cuenta.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* TARJETA DE PERFIL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-50 text-3xl font-bold text-blue-600">
              {user.nombre_completo
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-950">
              {
                user.nombre_completo
              }
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {user.email}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                <ShieldCheck
                  size={14}
                />

                {user.id_rol === 1
                  ? 'Administrador'
                  : 'Usuario'}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  user.esta_bloqueado
                    ? 'bg-red-50 text-red-700'
                    : 'bg-emerald-50 text-emerald-700'
                }`}
              >
                {user.esta_bloqueado
                  ? 'Bloqueado'
                  : 'Cuenta activa'}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-5 border-t border-slate-100 pt-5">
            <div className="flex items-start gap-3">
              <Mail
                size={18}
                className="mt-0.5 text-slate-400"
              />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Correo
                </p>

                <p className="mt-1 break-all text-sm font-medium text-slate-700">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User
                size={18}
                className="mt-0.5 text-slate-400"
              />

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Registro
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {formatDate(
                    user.fecha_registro,
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FORMULARIO */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <User
                size={21}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-950">
                Información personal
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Actualiza tu nombre y descripción.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            {/* NOMBRE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nombre completo
              </label>

              <input
                value={nombre}
                maxLength={150}
                disabled={
                  isSaving
                }
                onChange={(event) =>
                  setNombre(
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {
                  nombre.length
                }
                /150
              </p>
            </div>

            {/* CORREO */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>

              <input
                value={
                  user.email
                }
                disabled
                className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
              />

              <p className="mt-1 text-xs text-slate-400">
                El correo electrónico no puede modificarse desde esta sección.
              </p>
            </div>

            {/* DESCRIPCIÓN */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Descripción
              </label>

              <textarea
                value={
                  descripcion
                }
                maxLength={250}
                rows={5}
                disabled={
                  isSaving
                }
                onChange={(event) =>
                  setDescripcion(
                    event.target.value,
                  )
                }
                placeholder="Cuéntanos brevemente sobre ti..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {
                  descripcion.length
                }
                /250
              </p>
            </div>
          </div>

          {/* GUARDAR */}
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
            <button
              type="button"
              disabled={
                isSaving
              }
              onClick={
                handleSave
              }
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save
                size={17}
              />

              {isSaving
                ? 'Guardando...'
                : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage