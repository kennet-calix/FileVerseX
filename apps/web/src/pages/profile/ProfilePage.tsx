import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Camera,
  CheckCircle2,
  Mail,
  Save,
  ShieldCheck,
  Upload,
  User,
  X,
  XCircle,
} from 'lucide-react'

import {
  getMeRequest,
  updateMyProfilePhotoRequest,
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

const API_URL =
  'http://localhost:3000'

const MAX_PHOTO_SIZE =
  5 * 1024 * 1024

const ALLOWED_PHOTO_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
]

function ProfilePage() {
  const { updateUser } =
    useAuth()

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  const [user, setUser] =
    useState<AuthUser | null>(
      null,
    )

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

  const [
    isUploadingPhoto,
    setIsUploadingPhoto,
  ] = useState(false)

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] = useState<File | null>(
    null,
  )

  const [
    photoPreview,
    setPhotoPreview,
  ] = useState<string | null>(
    null,
  )

  const [
    photoVersion,
    setPhotoVersion,
  ] = useState(Date.now())

  const [toast, setToast] =
    useState<ToastState | null>(
      null,
    )

  /*
    CARGAR PERFIL
  */
  useEffect(() => {
    void loadProfile()
  }, [])

  /*
    CERRAR TOAST
  */
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

  /*
    LIBERAR PREVISUALIZACIÓN
  */
  useEffect(() => {
    return () => {
      if (
        photoPreview &&
        photoPreview.startsWith(
          'blob:',
        )
      ) {
        URL.revokeObjectURL(
          photoPreview,
        )
      }
    }
  }, [photoPreview])

  function showToast(
    message: string,
    type: ToastType,
  ) {
    setToast({
      message,
      type,
    })
  }

  /*
    OBTENER PERFIL DESDE API
  */
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
        currentUser.descripcion ??
          '',
      )

      setPhotoVersion(
        Date.now(),
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

  /*
    CONSTRUIR URL DE LA FOTO
    GUARDADA EN EL SERVIDOR
  */
  function getProfilePhotoUrl(
    photo?: string | null,
  ): string | null {
    if (
      !photo ||
      photo ===
        'default_profile.png'
    ) {
      return null
    }

    /*
      Si en algún momento la BD
      guarda una URL completa.
    */
    if (
      photo.startsWith(
        'http://',
      ) ||
      photo.startsWith(
        'https://',
      )
    ) {
      return photo
    }

    return `${API_URL}/uploads/profiles/${encodeURIComponent(
      photo,
    )}?v=${photoVersion}`
  }

  /*
    ABRIR SELECTOR
  */
  function handleOpenPhotoSelector() {
    if (isUploadingPhoto) {
      return
    }

    fileInputRef.current?.click()
  }

  /*
    SELECCIONAR FOTO
  */
  function handlePhotoSelected(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    /*
      VALIDAR FORMATO
    */
    if (
      !ALLOWED_PHOTO_TYPES.includes(
        file.type,
      )
    ) {
      showToast(
        'La foto debe ser JPG, PNG o WEBP',
        'error',
      )

      event.target.value = ''

      return
    }

    /*
      VALIDAR TAMAÑO
    */
    if (
      file.size >
      MAX_PHOTO_SIZE
    ) {
      showToast(
        'La foto no puede superar los 5 MB',
        'error',
      )

      event.target.value = ''

      return
    }

    /*
      ELIMINAR PREVISUALIZACIÓN
      ANTERIOR
    */
    if (
      photoPreview &&
      photoPreview.startsWith(
        'blob:',
      )
    ) {
      URL.revokeObjectURL(
        photoPreview,
      )
    }

    /*
      CREAR PREVISUALIZACIÓN
    */
    const preview =
      URL.createObjectURL(
        file,
      )

    setSelectedPhoto(file)

    setPhotoPreview(
      preview,
    )
  }

  /*
    CANCELAR FOTO
  */
  function handleCancelPhoto() {
    if (
      photoPreview &&
      photoPreview.startsWith(
        'blob:',
      )
    ) {
      URL.revokeObjectURL(
        photoPreview,
      )
    }

    setSelectedPhoto(null)

    setPhotoPreview(null)

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        ''
    }
  }

  /*
    GUARDAR FOTO
  */
  async function handleUploadPhoto() {
    if (!selectedPhoto) {
      showToast(
        'Selecciona una fotografía',
        'error',
      )

      return
    }

    setIsUploadingPhoto(true)

    try {
      const updatedUser =
        await updateMyProfilePhotoRequest(
          selectedPhoto,
        )

      /*
        IMPORTANTE:
        La respuesta del backend contiene
        el nuevo foto_perfil.
      */
      setUser(updatedUser)

      /*
        También actualizamos AuthContext.
      */
      updateUser(updatedUser)

      /*
        Liberamos el blob temporal.
      */
      if (
        photoPreview &&
        photoPreview.startsWith(
          'blob:',
        )
      ) {
        URL.revokeObjectURL(
          photoPreview,
        )
      }

      /*
        Dejamos de utilizar la vista
        previa. A partir de aquí la foto
        se obtiene desde el servidor.
      */
      setPhotoPreview(null)

      setSelectedPhoto(null)

      /*
        Cambiamos la versión para evitar
        caché del navegador.
      */
      setPhotoVersion(
        Date.now(),
      )

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          ''
      }

      showToast(
        'Foto de perfil actualizada correctamente',
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
          'No fue posible actualizar la foto de perfil',
          'error',
        )
      }
    } finally {
      setIsUploadingPhoto(
        false,
      )
    }
  }

  /*
    GUARDAR NOMBRE Y DESCRIPCIÓN
  */
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
      cleanDescription.length >
      250
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

      setUser(updatedUser)

      updateUser(updatedUser)

      setNombre(
        updatedUser.nombre_completo,
      )

      setDescripcion(
        updatedUser.descripcion ??
          '',
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

  /*
    FORMATEAR FECHA
  */
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

  /*
    CARGANDO
  */
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

  /*
    ERROR
  */
  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        No fue posible cargar la
        información del usuario.
      </div>
    )
  }

  /*
    FOTO PERSISTENTE
  */
  const serverPhotoUrl =
    getProfilePhotoUrl(
      user.foto_perfil,
    )

  /*
    Si el usuario está seleccionando
    una foto nueva, mostramos preview.

    Si no, mostramos la foto guardada
    en el backend.
  */
  const displayedPhoto =
    photoPreview ??
    serverPhotoUrl

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
          Administra tu información
          personal y los datos de tu
          cuenta.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        {/* TARJETA PERFIL */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            {/* AVATAR */}
            <div className="relative">
              <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-50 text-3xl font-bold text-blue-600 shadow-md">
                {displayedPhoto ? (
                  <img
                    key={
                      displayedPhoto
                    }
                    src={
                      displayedPhoto
                    }
                    alt="Foto de perfil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  user.nombre_completo
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <button
                type="button"
                title="Cambiar foto"
                disabled={
                  isUploadingPhoto
                }
                onClick={
                  handleOpenPhotoSelector
                }
                className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Camera
                  size={17}
                />
              </button>
            </div>

            {/* INPUT FOTO */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={
                handlePhotoSelected
              }
              className="hidden"
            />

            {/* CAMBIAR FOTO */}
            <button
              type="button"
              disabled={
                isUploadingPhoto
              }
              onClick={
                handleOpenPhotoSelector
              }
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera
                size={16}
              />

              Cambiar foto
            </button>

            <p className="mt-2 text-xs text-slate-400">
              JPG, PNG o WEBP ·
              Máximo 5 MB
            </p>

            {/* FOTO SELECCIONADA */}
            {selectedPhoto && (
              <div className="mt-4 w-full rounded-xl border border-blue-100 bg-blue-50 p-3">
                <p className="truncate text-xs font-medium text-slate-700">
                  {
                    selectedPhoto.name
                  }
                </p>

                <div className="mt-3 flex justify-center gap-2">
                  <button
                    type="button"
                    disabled={
                      isUploadingPhoto
                    }
                    onClick={
                      handleCancelPhoto
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X
                      size={14}
                    />

                    Cancelar
                  </button>

                  <button
                    type="button"
                    disabled={
                      isUploadingPhoto
                    }
                    onClick={
                      handleUploadPhoto
                    }
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Upload
                      size={14}
                    />

                    {isUploadingPhoto
                      ? 'Subiendo...'
                      : 'Guardar foto'}
                  </button>
                </div>
              </div>
            )}

            {/* DATOS */}
            <h2 className="mt-5 text-xl font-bold text-slate-950">
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

                {user.id_rol ===
                1
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

          {/* INFORMACIÓN */}
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

        {/* INFORMACIÓN PERSONAL */}
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
                Actualiza tu nombre
                y descripción.
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
                onChange={(
                  event,
                ) =>
                  setNombre(
                    event.target
                      .value,
                  )
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50"
              />

              <p className="mt-1 text-right text-xs text-slate-400">
                {nombre.length}
                /150
              </p>
            </div>

            {/* CORREO */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>

              <input
                value={user.email}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
              />

              <p className="mt-1 text-xs text-slate-400">
                El correo
                electrónico no
                puede modificarse
                desde esta sección.
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
                onChange={(
                  event,
                ) =>
                  setDescripcion(
                    event.target
                      .value,
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