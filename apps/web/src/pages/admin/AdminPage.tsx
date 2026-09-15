import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Ban,
  CheckCircle2,
  FileText,
  Lock,
  Search,
  ShieldCheck,
  Unlock,
  UserRound,
  Users,
  X,
  XCircle,
} from 'lucide-react'

import {
  activateFileRequest,
  blockUserRequest,
  getAdminFilesRequest,
  getAdminStatsRequest,
  getAdminUsersRequest,
  restrictFileRequest,
  type AdminFile,
  type AdminStats,
  type AdminUser,
  unblockUserRequest,
} from '../../features/admin/services/admin.service'

type ActiveTab = 'users' | 'files'
type ToastType = 'success' | 'error'

interface ToastState {
  message: string
  type: ToastType
}

function AdminPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsuarios: 0,
    usuariosBloqueados: 0,
    totalArchivos: 0,
    archivosRestringidos: 0,
  })

  const [users, setUsers] = useState<AdminUser[]>([])
  const [files, setFiles] = useState<AdminFile[]>([])

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('users')

  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const [processingUserId, setProcessingUserId] =
    useState<number | null>(null)

  const [processingFileId, setProcessingFileId] =
    useState<number | null>(null)

  const [toast, setToast] =
    useState<ToastState | null>(null)

  useEffect(() => {
    loadAdminData()
  }, [])

  useEffect(() => {
    if (!toast) {
      return
    }

    const timeout = window.setTimeout(() => {
      setToast(null)
    }, 3500)

    return () => {
      window.clearTimeout(timeout)
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

  async function loadAdminData() {
    setIsLoading(true)

    try {
      const [
        statsData,
        usersData,
        filesData,
      ] = await Promise.all([
        getAdminStatsRequest(),
        getAdminUsersRequest(),
        getAdminFilesRequest(),
      ])

      setStats(statsData)
      setUsers(usersData)
      setFiles(filesData)
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error')
      } else {
        showToast(
          'No fue posible cargar el panel administrativo',
          'error',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshStats() {
    try {
      const statsData =
        await getAdminStatsRequest()

      setStats(statsData)
    } catch {
      // No bloqueamos la interfaz si solo falla
      // la actualización de estadísticas.
    }
  }

  async function handleToggleUser(
    user: AdminUser,
  ) {
    setProcessingUserId(user.id_usuario)

    try {
      const updatedUser =
        user.esta_bloqueado
          ? await unblockUserRequest(
              user.id_usuario,
            )
          : await blockUserRequest(
              user.id_usuario,
            )

      setUsers((current) =>
        current.map((item) =>
          item.id_usuario ===
          updatedUser.id_usuario
            ? updatedUser
            : item,
        ),
      )

      showToast(
        updatedUser.esta_bloqueado
          ? 'Usuario bloqueado correctamente'
          : 'Usuario desbloqueado correctamente',
        'success',
      )

      await refreshStats()
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error')
      } else {
        showToast(
          'No fue posible actualizar el usuario',
          'error',
        )
      }
    } finally {
      setProcessingUserId(null)
    }
  }

  async function handleToggleFile(
    file: AdminFile,
  ) {
    setProcessingFileId(file.id_archivo)

    try {
      const updatedFile =
        file.estado === 'restringido'
          ? await activateFileRequest(
              file.id_archivo,
            )
          : await restrictFileRequest(
              file.id_archivo,
            )

      setFiles((current) =>
        current.map((item) =>
          item.id_archivo ===
          updatedFile.id_archivo
            ? updatedFile
            : item,
        ),
      )

      showToast(
        updatedFile.estado === 'restringido'
          ? 'Archivo restringido correctamente'
          : 'Archivo activado correctamente',
        'success',
      )

      await refreshStats()
    } catch (error) {
      if (error instanceof Error) {
        showToast(error.message, 'error')
      } else {
        showToast(
          'No fue posible actualizar el archivo',
          'error',
        )
      }
    } finally {
      setProcessingFileId(null)
    }
  }

  const filteredUsers = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim()

    if (!value) {
      return users
    }

    return users.filter((user) => {
      return (
        user.nombre_completo
          .toLowerCase()
          .includes(value) ||
        user.email
          .toLowerCase()
          .includes(value)
      )
    })
  }, [users, search])

  const filteredFiles = useMemo(() => {
    const value = search
      .toLowerCase()
      .trim()

    if (!value) {
      return files
    }

    return files.filter((file) =>
      file.nombre_original
        .toLowerCase()
        .includes(value),
    )
  }, [files, search])

  function formatSize(bytes: number) {
    if (bytes === 0) {
      return '0 B'
    }

    const units = [
      'B',
      'KB',
      'MB',
      'GB',
    ]

    const index = Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    )

    const value =
      bytes /
      Math.pow(
        1024,
        index,
      )

    return `${value.toFixed(
      index === 0 ? 0 : 1,
    )} ${units[index]}`
  }

  function formatDate(
    date: string | null,
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
    ).format(new Date(date))
  }

  return (
    <div className="relative space-y-6">
      {/* TOAST */}
      {toast && (
        <div className="fixed right-6 top-6 z-50 w-full max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-2xl border bg-white px-4 py-4 shadow-xl ${
              toast.type === 'success'
                ? 'border-emerald-200 text-emerald-700'
                : 'border-red-200 text-red-700'
            }`}
          >
            {toast.type === 'success' ? (
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
                {toast.type === 'success'
                  ? 'Operación completada'
                  : 'Ocurrió un problema'}
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {toast.message}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setToast(null)}
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
          Administración
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Panel administrativo
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Supervisa usuarios, archivos y el estado general de FileVerseX.
        </p>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={21} />
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Total de usuarios
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.totalUsuarios}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <Lock size={21} />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Usuarios bloqueados
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.usuariosBloqueados}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText size={21} />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Total de archivos
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.totalArchivos}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Ban size={21} />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Archivos restringidos
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {stats.archivosRestringidos}
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('users')
                setSearch('')
              }}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users size={17} />
              Usuarios
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('files')
                setSearch('')
              }}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${
                activeTab === 'files'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText size={17} />
              Archivos
            </button>
          </div>

          <div className="relative w-full lg:w-80">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder={
                activeTab === 'users'
                  ? 'Buscar usuario...'
                  : 'Buscar archivo...'
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="text-sm text-slate-500">
                Cargando información administrativa...
              </p>
            </div>
          </div>
        ) : activeTab === 'users' ? (
          /* USUARIOS */
          filteredUsers.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <UserRound
                size={34}
                className="text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-900">
                No se encontraron usuarios
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <div
                  key={user.id_usuario}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 lg:flex-row lg:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-600">
                      {user.nombre_completo
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {user.nombre_completo}
                        </p>

                        {user.id_rol === 1 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            <ShieldCheck size={13} />
                            Administrador
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-sm text-slate-500">
                        {user.email}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Registrado: {formatDate(
                          user.fecha_registro,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        user.esta_bloqueado
                          ? 'bg-red-50 text-red-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {user.esta_bloqueado
                        ? 'Bloqueado'
                        : 'Activo'}
                    </span>

                    {user.id_rol !== 1 && (
                      <button
                        type="button"
                        disabled={
                          processingUserId ===
                          user.id_usuario
                        }
                        onClick={() =>
                          handleToggleUser(
                            user,
                          )
                        }
                        className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          user.esta_bloqueado
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        {user.esta_bloqueado ? (
                          <>
                            <Unlock size={15} />
                            Desbloquear
                          </>
                        ) : (
                          <>
                            <Lock size={15} />
                            Bloquear
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* ARCHIVOS */
          filteredFiles.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <FileText
                size={34}
                className="text-slate-300"
              />

              <p className="mt-4 font-semibold text-slate-900">
                No se encontraron archivos
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredFiles.map((file) => (
                <div
                  key={file.id_archivo}
                  className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 lg:flex-row lg:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FileText size={20} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {file.nombre_original}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          Usuario #{file.id_usuario}
                        </span>

                        <span>
                          {formatSize(
                            Number(
                              file.tamano_bytes,
                            ),
                          )}
                        </span>

                        <span>
                          {file.contador_descargas ??
                            0}{' '}
                          descarga(s)
                        </span>
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        Subido: {formatDate(
                          file.fecha_subida,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 lg:justify-end">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        file.estado ===
                        'activo'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {file.estado}
                    </span>

                    <button
                      type="button"
                      disabled={
                        processingFileId ===
                        file.id_archivo
                      }
                      onClick={() =>
                        handleToggleFile(
                          file,
                        )
                      }
                      className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                        file.estado ===
                        'restringido'
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {file.estado ===
                      'restringido' ? (
                        <>
                          <CheckCircle2
                            size={15}
                          />
                          Activar
                        </>
                      ) : (
                        <>
                          <Ban size={15} />
                          Restringir
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default AdminPage