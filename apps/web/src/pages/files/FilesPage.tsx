import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react'

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  File,
  FileText,
  Image,
  Search,
  Share2,
  Trash2,
  UploadCloud,
  X,
  XCircle,
} from 'lucide-react'

import {
  deleteFileRequest,
  downloadFileRequest,
  getFilesRequest,
  previewFileRequest,
  type FileItem,
  uploadFileWithProgress,
} from '../../features/files/services/file.service'

import PublishModal from '../../features/publications/components/PublishModal'

type ToastType = 'success' | 'error'

interface ToastState {
  message: string
  type: ToastType
}

function FilesPage() {
  const inputRef =
    useRef<HTMLInputElement | null>(null)

  const [files, setFiles] =
    useState<FileItem[]>([])

  const [search, setSearch] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [isUploading, setIsUploading] =
    useState(false)

  const [isDragging, setIsDragging] =
    useState(false)

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0)

  const [
    fileToDelete,
    setFileToDelete,
  ] = useState<FileItem | null>(null)

  const [
    fileToPublish,
    setFileToPublish,
  ] = useState<FileItem | null>(null)

  const [isDeleting, setIsDeleting] =
    useState(false)

  const [toast, setToast] =
    useState<ToastState | null>(null)

  const [
    previewIndex,
    setPreviewIndex,
  ] = useState<number | null>(null)

  const [
    previewUrl,
    setPreviewUrl,
  ] = useState('')

  const [
    isPreviewLoading,
    setIsPreviewLoading,
  ] = useState(false)

  const [
    previewError,
    setPreviewError,
  ] = useState('')

  useEffect(() => {
    loadFiles()
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

  async function loadFiles() {
    setIsLoading(true)

    try {
      const data =
        await getFilesRequest()

      setFiles(data)
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible cargar los archivos',
          'error',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function uploadFiles(
    selectedFiles: File[],
  ) {
    if (
      isUploading ||
      selectedFiles.length === 0
    ) {
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    let uploadedCount = 0

    try {
      for (
        let index = 0;
        index < selectedFiles.length;
        index++
      ) {
        const file =
          selectedFiles[index]

        await uploadFileWithProgress(
          file,
          (fileProgress) => {
            const completedProgress =
              (index /
                selectedFiles.length) *
              100

            const currentProgress =
              fileProgress /
              selectedFiles.length

            setUploadProgress(
              Math.round(
                completedProgress +
                  currentProgress,
              ),
            )
          },
        )

        uploadedCount++
      }

      showToast(
        uploadedCount === 1
          ? 'Archivo cargado correctamente'
          : `${uploadedCount} archivos cargados correctamente`,
        'success',
      )

      await loadFiles()
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          uploadedCount > 0
            ? `${uploadedCount} archivo(s) fueron cargados. ${error.message}`
            : error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible completar la carga de los archivos',
          'error',
        )
      }

      await loadFiles()
    } finally {
      setIsUploading(false)

      window.setTimeout(() => {
        setUploadProgress(0)
      }, 500)

      if (inputRef.current) {
        inputRef.current.value =
          ''
      }
    }
  }

  async function handleFileSelect(
    event:
      ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFiles =
      Array.from(
        event.target.files ?? [],
      )

    if (
      selectedFiles.length === 0
    ) {
      return
    }

    await uploadFiles(
      selectedFiles,
    )
  }
  function handleDragOver(
    event:
      DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()

    if (!isUploading) {
      setIsDragging(true)
    }
  }

  function handleDragLeave(
    event:
      DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()

    setIsDragging(false)
  }

  async function handleDrop(
    event:
      DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault()
    event.stopPropagation()

    setIsDragging(false)

    if (isUploading) {
      return
    }

    const droppedFiles =
      Array.from(
        event.dataTransfer.files ?? [],
      )

    if (
      droppedFiles.length === 0
    ) {
      return
    }

    await uploadFiles(
      droppedFiles,
    )
  }
  async function handleDownload(
    file: FileItem,
  ) {
    try {
      await downloadFileRequest(
        file.id_archivo,
        file.nombre_original,
      )

      showToast(
        'Descarga iniciada correctamente',
        'success',
      )

      await loadFiles()
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible descargar el archivo',
          'error',
        )
      }
    }
  }

  async function confirmDelete() {
    if (!fileToDelete) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteFileRequest(
        fileToDelete.id_archivo,
      )

      setFiles(
        (currentFiles) =>
          currentFiles.filter(
            (file) =>
              file.id_archivo !==
              fileToDelete.id_archivo,
          ),
      )

      showToast(
        'Archivo eliminado correctamente',
        'success',
      )

      setFileToDelete(null)
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          error.message,
          'error',
        )
      } else {
        showToast(
          'No fue posible eliminar el archivo',
          'error',
        )
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredFiles =
    useMemo(() => {
      const value =
        search
          .toLowerCase()
          .trim()

      if (!value) {
        return files
      }

      return files.filter(
        (file) =>
          file.nombre_original
            .toLowerCase()
            .includes(value),
      )
    }, [files, search])

  const totalStorage =
    useMemo(() => {
      return files.reduce(
        (total, file) =>
          total +
          Number(
            file.tamano_bytes,
          ),
        0,
      )
    }, [files])

  const totalDownloads =
    useMemo(() => {
      return files.reduce(
        (total, file) =>
          total +
          Number(
            file.contador_descargas ??
              0,
          ),
        0,
      )
    }, [files])

  const previewFile =
    previewIndex !== null
      ? filteredFiles[
          previewIndex
        ] ?? null
      : null

  useEffect(() => {
    if (!previewFile) {
      return
    }

    const currentPreviewFile =
      previewFile

    let objectUrl = ''
    let cancelled = false

    async function loadPreview() {
      setIsPreviewLoading(true)
      setPreviewError('')
      setPreviewUrl('')

      try {
        const blob =
          await previewFileRequest(
            currentPreviewFile
              .id_archivo,
          )

        if (cancelled) {
          return
        }

        objectUrl =
          URL.createObjectURL(
            blob,
          )

        setPreviewUrl(
          objectUrl,
        )
      } catch (error) {
        if (cancelled) {
          return
        }

        if (
          error instanceof Error
        ) {
          setPreviewError(
            error.message,
          )
        } else {
          setPreviewError(
            'No fue posible visualizar el archivo',
          )
        }
      } finally {
        if (!cancelled) {
          setIsPreviewLoading(
            false,
          )
        }
      }
    }

    loadPreview()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl,
        )
      }
    }
  }, [
    previewFile?.id_archivo,
  ])

  useEffect(() => {
    if (!previewFile) {
      return
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        closePreview()
      }

      if (
        event.key ===
        'ArrowLeft'
      ) {
        showPreviousFile()
      }

      if (
        event.key ===
        'ArrowRight'
      ) {
        showNextFile()
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    previewFile,
    previewIndex,
    filteredFiles.length,
  ])

  function openPreview(
    file: FileItem,
  ) {
    const index =
      filteredFiles.findIndex(
        (item) =>
          item.id_archivo ===
          file.id_archivo,
      )

    if (index === -1) {
      return
    }

    setPreviewIndex(
      index,
    )
  }

  function closePreview() {
    setPreviewIndex(null)
    setPreviewUrl('')
    setPreviewError('')
    setIsPreviewLoading(false)
  }

  function showPreviousFile() {
    if (
      previewIndex === null ||
      filteredFiles.length === 0
    ) {
      return
    }

    setPreviewIndex(
      previewIndex === 0
        ? filteredFiles.length -
            1
        : previewIndex - 1,
    )
  }

  function showNextFile() {
    if (
      previewIndex === null ||
      filteredFiles.length === 0
    ) {
      return
    }

    setPreviewIndex(
      previewIndex ===
        filteredFiles.length - 1
        ? 0
        : previewIndex + 1,
    )
  }

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

    const index =
      Math.floor(
        Math.log(bytes) /
          Math.log(1024),
      )

    const safeIndex =
      Math.min(
        index,
        units.length - 1,
      )

    const value =
      bytes /
      Math.pow(
        1024,
        safeIndex,
      )

    return `${value.toFixed(
      safeIndex === 0
        ? 0
        : 1,
    )} ${units[safeIndex]}`
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
    ).format(
      new Date(date),
    )
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
        <div className="fixed right-6 top-6 z-[70] w-full max-w-sm">
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-4 shadow-xl ${
              toast.type ===
              'success'
                ? 'border-emerald-200 bg-white text-emerald-700'
                : 'border-red-200 bg-white text-red-700'
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

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Biblioteca personal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Mis archivos
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Administra tus documentos,
            imágenes y archivos desde tu
            espacio digital.
          </p>
        </div>

        <button
          type="button"
          disabled={isUploading}
          onClick={() =>
            inputRef.current?.click()
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <UploadCloud
            size={18}
          />

          {isUploading
            ? `Subiendo ${uploadProgress}%`
            : 'Subir archivos'}
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={
            handleFileSelect
          }
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.doc,.docx,.xls,.xlsx"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Total de archivos
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {files.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Almacenamiento utilizado
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {formatSize(
              totalStorage,
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Descargas
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              totalDownloads
            }
          </p>
        </div>
      </div>

      <div
        onDragOver={
          handleDragOver
        }
        onDragLeave={
          handleDragLeave
        }
        onDrop={
          handleDrop
        }
        onClick={() => {
          if (!isUploading) {
            inputRef.current?.click()
          }
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
          isUploading
            ? 'cursor-not-allowed border-slate-200 bg-slate-50'
            : isDragging
              ? 'cursor-pointer border-blue-500 bg-blue-50'
              : 'cursor-pointer border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/40'
        }`}
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <UploadCloud
            size={28}
          />
        </div>

        <h2 className="mt-4 text-base font-semibold text-slate-900">
          {isUploading
            ? 'Cargando archivos'
            : isDragging
              ? 'Suelta los archivos aquí'
              : 'Arrastra y suelta tus archivos'}
        </h2>

        {!isUploading && (
          <>
            <p className="mt-2 text-sm text-slate-500">
              También puedes hacer clic
              para seleccionar un archivo
              desde tu computadora.
            </p>

            <p className="mt-3 text-xs text-slate-400">
              PDF, Word, Excel, TXT,
              JPG, PNG y WEBP · máximo
              10 MB
            </p>
          </>
        )}

        {isUploading && (
          <div className="mx-auto mt-6 max-w-md">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                Subiendo archivos
              </span>

              <span className="text-sm font-semibold text-blue-600">
                {
                  uploadProgress
                }
                %
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-200"
                style={{
                  width: `${uploadProgress}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">
              Archivos almacenados
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {
                filteredFiles.length
              }{' '}
              archivo(s) encontrado(s)
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(
                event,
              ) =>
                setSearch(
                  event.target
                    .value,
                )
              }
              placeholder="Buscar archivo..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

              <p className="text-sm text-slate-500">
                Cargando archivos...
              </p>
            </div>
          </div>
        ) : filteredFiles.length ===
          0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FileText
                size={26}
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">
              No hay archivos
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? 'No se encontraron archivos que coincidan con tu búsqueda.'
                : 'Sube tu primer archivo para comenzar a organizar tu espacio digital.'}
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
                    className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Icon
                          size={22}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {
                            file.nombre_original
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span>
                            {formatSize(
                              Number(
                                file.tamano_bytes,
                              ),
                            )}
                          </span>

                          <span>
                            {formatDate(
                              file.fecha_subida,
                            )}
                          </span>

                          <span>
                            {file.contador_descargas ??
                              0}{' '}
                            descarga(s)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          file.estado ===
                          'activo'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {
                          file.estado
                        }
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          openPreview(
                            file,
                          )
                        }
                        title="Ver archivo"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Eye
                          size={18}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFileToPublish(
                            file,
                          )
                        }
                        disabled={
                          file.estado ===
                          'restringido'
                        }
                        title={
                          file.estado ===
                          'restringido'
                            ? 'Un archivo restringido no puede publicarse'
                            : 'Publicar archivo'
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Share2
                          size={18}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            file,
                          )
                        }
                        title="Descargar archivo"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Download
                          size={18}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFileToDelete(
                            file,
                          )
                        }
                        title="Eliminar archivo"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>
                  </div>
                )
              },
            )}
          </div>
        )}
      </div>

      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">
                  {
                    previewFile.nombre_original
                  }
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {previewIndex !==
                  null
                    ? previewIndex +
                      1
                    : 0}{' '}
                  de{' '}
                  {
                    filteredFiles.length
                  }
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      previewFile,
                    )
                  }
                  title="Descargar archivo"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                >
                  <Download
                    size={19}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    closePreview
                  }
                  title="Cerrar visor"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <X
                    size={20}
                  />
                </button>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-slate-100">
              {filteredFiles.length >
                1 && (
                <button
                  type="button"
                  onClick={
                    showPreviousFile
                  }
                  title="Archivo anterior"
                  className="absolute left-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:text-blue-600"
                >
                  <ChevronLeft
                    size={28}
                  />
                </button>
              )}

              {filteredFiles.length >
                1 && (
                <button
                  type="button"
                  onClick={
                    showNextFile
                  }
                  title="Archivo siguiente"
                  className="absolute right-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg hover:text-blue-600"
                >
                  <ChevronRight
                    size={28}
                  />
                </button>
              )}

              {isPreviewLoading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />

                  <p className="text-sm text-slate-500">
                    Cargando archivo...
                  </p>
                </div>
              ) : previewError ? (
                <div className="rounded-2xl border border-red-200 bg-white p-6 text-center">
                  <XCircle
                    size={38}
                    className="mx-auto text-red-500"
                  />

                  <p className="mt-4 text-sm text-red-600">
                    {
                      previewError
                    }
                  </p>
                </div>
              ) : previewUrl &&
                previewFile.tipo_mime.startsWith(
                  'image/',
                ) ? (
                <img
                  src={previewUrl}
                  alt={
                    previewFile.nombre_original
                  }
                  className="max-h-full max-w-full object-contain p-6"
                />
              ) : previewUrl &&
                previewFile.tipo_mime ===
                  'application/pdf' ? (
                <iframe
                  src={previewUrl}
                  title={
                    previewFile.nombre_original
                  }
                  className="h-full w-full border-0 bg-white"
                />
              ) : (
                <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
                  <FileText
                    size={48}
                    className="mx-auto text-slate-400"
                  />

                  <h3 className="mt-4 font-semibold text-slate-900">
                    Vista previa no disponible
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Este tipo de archivo
                    no puede mostrarse
                    directamente.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleDownload(
                        previewFile,
                      )
                    }
                    className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    <Download
                      size={17}
                    />

                    Descargar archivo
                  </button>
                </div>
              )}
            </div>

            <div className="grid gap-2 border-t border-slate-200 px-5 py-3 text-xs text-slate-500 sm:grid-cols-4">
              <span>
                Tamaño:{' '}
                {formatSize(
                  Number(
                    previewFile.tamano_bytes,
                  ),
                )}
              </span>

              <span>
                Fecha:{' '}
                {formatDate(
                  previewFile.fecha_subida,
                )}
              </span>

              <span>
                Descargas:{' '}
                {previewFile.contador_descargas ??
                  0}
              </span>

              <span>
                Estado:{' '}
                {
                  previewFile.estado
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE PUBLICACIÓN */}
      {fileToPublish && (
        <PublishModal
          isOpen={true}
          onClose={() =>
            setFileToPublish(null)
          }
          tipoContenido="archivo"
          idContenido={
            fileToPublish.id_archivo
          }
          nombreContenido={
            fileToPublish.nombre_original
          }
          onPublished={() => {
            showToast(
              'Archivo publicado correctamente',
              'success',
            )
          }}
        />
      )}

      {/* MODAL DE ELIMINACIÓN */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2
                size={22}
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Eliminar archivo
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              ¿Estás seguro de que
              deseas eliminar{' '}
              <span className="font-semibold text-slate-700">
                {
                  fileToDelete.nombre_original
                }
              </span>
              ? Esta acción no se
              puede deshacer.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={
                  isDeleting
                }
                onClick={() =>
                  setFileToDelete(
                    null,
                  )
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={
                  isDeleting
                }
                onClick={
                  confirmDelete
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2
                  size={16}
                />

                {isDeleting
                  ? 'Eliminando...'
                  : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilesPage