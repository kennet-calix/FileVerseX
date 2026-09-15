import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowLeft,
  CheckCircle2,
  File,
  FileText,
  Folder,
  Image,
  Plus,
  Search,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'

import {
  addFileToCollectionRequest,
  getCollectionFilesRequest,
  removeFileFromCollectionRequest,
  type CollectionFileItem,
} from '../../features/collections/services/collection.service'

import {
  getFilesRequest,
  type FileItem,
} from '../../features/files/services/file.service'

import {
  Link,
  useParams,
} from 'react-router-dom'

type ToastType = 'success' | 'error'

interface ToastState {
  message: string
  type: ToastType
}

function CollectionDetailPage() {
  const { id } = useParams()

  const idColeccion = Number(id)

  const [collectionFiles, setCollectionFiles] =
    useState<CollectionFileItem[]>([])

  const [allFiles, setAllFiles] = useState<FileItem[]>([])

  const [search, setSearch] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  const [showAddModal, setShowAddModal] =
    useState(false)

  const [toast, setToast] =
    useState<ToastState | null>(null)

  useEffect(() => {
    loadData()
  }, [idColeccion])

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

  async function loadData() {
    if (
      !Number.isInteger(idColeccion) ||
      idColeccion <= 0
    ) {
      showToast(
        'La colección seleccionada no es válida',
        'error',
      )

      setIsLoading(false)
      return
    }

    setIsLoading(true)

    try {
      const [
        collectionFilesData,
        allFilesData,
      ] = await Promise.all([
        getCollectionFilesRequest(
          idColeccion,
        ),
        getFilesRequest(),
      ])

      setCollectionFiles(
        collectionFilesData,
      )

      setAllFiles(allFilesData)
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible cargar la colección',
          'error',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddFile(
    file: FileItem,
  ) {
    setIsAdding(true)

    try {
      await addFileToCollectionRequest(
        idColeccion,
        file.id_archivo,
      )

      showToast(
        'Archivo agregado a la colección',
        'success',
      )

      await loadData()
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible agregar el archivo',
          'error',
        )
      }
    } finally {
      setIsAdding(false)
    }
  }

  async function handleRemoveFile(
    file: CollectionFileItem,
  ) {
    try {
      await removeFileFromCollectionRequest(
        idColeccion,
        file.id_archivo,
      )

      setCollectionFiles(
        (current) =>
          current.filter(
            (item) =>
              item.id_archivo !==
              file.id_archivo,
          ),
      )

      showToast(
        'Archivo removido de la colección',
        'success',
      )
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible quitar el archivo',
          'error',
        )
      }
    }
  }

  const filteredFiles = useMemo(() => {
    const value =
      search.toLowerCase().trim()

    if (!value) {
      return collectionFiles
    }

    return collectionFiles.filter(
      (file) =>
        file.nombre_original
          .toLowerCase()
          .includes(value),
    )
  }, [
    collectionFiles,
    search,
  ])

  const availableFiles =
    useMemo(() => {
      const ids = new Set(
        collectionFiles.map(
          (file) => file.id_archivo,
        ),
      )

      return allFiles.filter(
        (file) =>
          !ids.has(
            file.id_archivo,
          ),
      )
    }, [
      allFiles,
      collectionFiles,
    ])

  function formatSize(
    bytes: number,
  ) {
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

  function getFileIcon(
    mimeType: string,
  ) {
    if (
      mimeType.startsWith(
        'image/',
      )
    ) {
      return Image
    }

    if (
      mimeType ===
      'application/pdf'
    ) {
      return FileText
    }

    return File
  }

  return (
    <div className="relative space-y-6">
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
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            to="/collections"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Volver a colecciones
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Folder size={23} />
            </div>

            <div>
              <p className="text-sm font-semibold text-blue-600">
                Colección
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                Archivos de la colección
              </h1>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowAddModal(true)
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Agregar archivo
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Archivos en colección
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              collectionFiles.length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Archivos disponibles
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              availableFiles.length
            }
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">
              Contenido de la colección
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {
                filteredFiles.length
              }{' '}
              archivo(s)
            </p>
          </div>

          <div className="relative w-full sm:w-72">
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
              placeholder="Buscar archivo..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          </div>
        ) : filteredFiles.length ===
          0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Folder
              size={36}
              className="text-slate-300"
            />

            <h3 className="mt-4 font-semibold text-slate-900">
              Esta colección está vacía
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Agrega archivos existentes
              desde tu biblioteca personal.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredFiles.map(
              (file) => {
                const Icon =
                  getFileIcon(
                    file.tipo_mime,
                  )

                return (
                  <div
                    key={
                      file.id_archivo
                    }
                    className="flex items-center gap-4 p-5 transition hover:bg-slate-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon
                        size={21}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {
                          file.nombre_original
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatSize(
                          Number(
                            file.tamano_bytes,
                          ),
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveFile(
                          file,
                        )
                      }
                      title="Quitar de la colección"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2
                        size={18}
                      />
                    </button>
                  </div>
                )
              },
            )}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Agregar archivo
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Selecciona un archivo de tu
                  biblioteca personal.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(
                    false,
                  )
                }
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-6 max-h-80 overflow-y-auto rounded-xl border border-slate-200">
              {availableFiles.length ===
              0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-slate-500">
                    No hay archivos disponibles
                    para agregar.
                  </p>
                </div>
              ) : (
                availableFiles.map(
                  (file) => {
                    const Icon =
                      getFileIcon(
                        file.tipo_mime,
                      )

                    return (
                      <div
                        key={
                          file.id_archivo
                        }
                        className="flex items-center gap-3 border-b border-slate-100 p-4 last:border-b-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Icon
                            size={19}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {
                              file.nombre_original
                            }
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatSize(
                              Number(
                                file.tamano_bytes,
                              ),
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          disabled={
                            isAdding
                          }
                          onClick={() =>
                            handleAddFile(
                              file,
                            )
                          }
                          className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Plus
                            size={15}
                          />
                          Agregar
                        </button>
                      </div>
                    )
                  },
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollectionDetailPage