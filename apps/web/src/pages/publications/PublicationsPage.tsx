import {
  useEffect,
  useState,
} from 'react'

import {
  CheckCircle2,
  FileText,
  Folder,
  Globe2,
  Heart,
  LockKeyhole,
  MessageCircle,
  Send,
  Users,
  XCircle,
} from 'lucide-react'

import {
  createPublicationCommentRequest,
  getPublicationCommentsRequest,
  getPublicationsRequest,
  togglePublicationLikeRequest,
  type Publication,
  type PublicationComment,
} from '../../features/publications/services/publication.service'

type ToastType =
  | 'success'
  | 'error'

interface ToastState {
  message: string
  type: ToastType
}

function PublicationsPage() {
  const [
    publications,
    setPublications,
  ] = useState<Publication[]>([])

  const [
    comments,
    setComments,
  ] = useState<
    Record<
      number,
      PublicationComment[]
    >
  >({})

  const [
    commentText,
    setCommentText,
  ] = useState<
    Record<number, string>
  >({})

  const [
    loadingComments,
    setLoadingComments,
  ] = useState<
    Record<number, boolean>
  >({})

  const [
    openComments,
    setOpenComments,
  ] = useState<
    Record<number, boolean>
  >({})

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    toast,
    setToast,
  ] =
    useState<ToastState | null>(
      null,
    )

  useEffect(() => {
    loadPublications()
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

  async function loadPublications() {
    setIsLoading(true)

    try {
      const data =
        await getPublicationsRequest()

      setPublications(data)
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
          'No fue posible cargar las publicaciones',
          'error',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleLike(
    publication: Publication,
  ) {
    try {
      const liked =
        await togglePublicationLikeRequest(
          publication.id_publicacion,
        )

      setPublications(
        (current) =>
          current.map(
            (item) => {
              if (
                item.id_publicacion !==
                publication.id_publicacion
              ) {
                return item
              }

              const currentTotal =
                item.total_likes ??
                0

              return {
                ...item,

                usuario_dio_like:
                  liked,

                total_likes:
                  liked
                    ? currentTotal +
                      1
                    : Math.max(
                        0,
                        currentTotal -
                          1,
                      ),
              }
            },
          ),
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
          'No fue posible actualizar el like',
          'error',
        )
      }
    }
  }

  async function handleToggleComments(
    idPublication: number,
  ) {
    const willOpen =
      !openComments[
        idPublication
      ]

    setOpenComments(
      (current) => ({
        ...current,

        [idPublication]:
          willOpen,
      }),
    )

    if (
      !willOpen ||
      comments[
        idPublication
      ]
    ) {
      return
    }

    setLoadingComments(
      (current) => ({
        ...current,

        [idPublication]:
          true,
      }),
    )

    try {
      const data =
        await getPublicationCommentsRequest(
          idPublication,
        )

      setComments(
        (current) => ({
          ...current,

          [idPublication]:
            data,
        }),
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
          'No fue posible cargar los comentarios',
          'error',
        )
      }
    } finally {
      setLoadingComments(
        (current) => ({
          ...current,

          [idPublication]:
            false,
        }),
      )
    }
  }

  async function handleComment(
    publication: Publication,
  ) {
    const text =
      commentText[
        publication
          .id_publicacion
      ]?.trim()

    if (!text) {
      showToast(
        'Escribe un comentario',
        'error',
      )

      return
    }

    try {
      await createPublicationCommentRequest(
        publication.id_publicacion,
        text,
      )

      /*
       * Volvemos a cargar comentarios
       * para obtener también el nombre
       * del usuario que comentó.
       */
      const updatedComments =
        await getPublicationCommentsRequest(
          publication.id_publicacion,
        )

      setComments(
        (current) => ({
          ...current,

          [
            publication.id_publicacion
          ]: updatedComments,
        }),
      )

      setCommentText(
        (current) => ({
          ...current,

          [
            publication.id_publicacion
          ]: '',
        }),
      )

      setPublications(
        (current) =>
          current.map(
            (item) =>
              item.id_publicacion ===
              publication.id_publicacion
                ? {
                    ...item,

                    total_comentarios:
                      (item.total_comentarios ??
                        0) + 1,
                  }
                : item,
          ),
      )

      showToast(
        'Comentario agregado correctamente',
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
          'No fue posible agregar el comentario',
          'error',
        )
      }
    }
  }

  function getScopeIcon(
    scope:
      Publication['alcance'],
  ) {
    if (
      scope === 'publica'
    ) {
      return Globe2
    }

    if (
      scope === 'dirigida'
    ) {
      return Users
    }

    return LockKeyhole
  }

  function getContentIcon(
    type:
      Publication['tipo_contenido'],
  ) {
    if (
      type === 'coleccion'
    ) {
      return Folder
    }

    return FileText
  }

  function getScopeLabel(
    scope:
      Publication['alcance'],
  ) {
    if (
      scope === 'publica'
    ) {
      return 'Pública'
    }

    if (
      scope === 'dirigida'
    ) {
      return 'Dirigida'
    }

    return 'Privada'
  }

  function getContentTypeLabel(
    publication:
      Publication,
  ) {
    return publication.tipo_contenido ===
      'archivo'
      ? 'archivo'
      : 'colección'
  }

  function formatDate(
    date: string,
  ) {
    return new Intl.DateTimeFormat(
      'es-HN',
      {
        dateStyle:
          'medium',

        timeStyle:
          'short',
      },
    ).format(
      new Date(date),
    )
  }

  function getInitials(
    name?: string,
  ) {
    if (!name) {
      return 'U'
    }

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((item) =>
        item
          .charAt(0)
          .toUpperCase(),
      )
      .join('')
  }

  return (
    <div className="relative space-y-6">

      {/* TOAST */}
      {toast && (
        <div className="fixed right-6 top-6 z-[90] w-full max-w-sm">

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

            <div>
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
          </div>
        </div>
      )}

      {/* HEADER */}
      <div>

        <p className="text-sm font-semibold text-blue-600">
          Comunidad
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          Publicaciones
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Descubre los archivos y
          colecciones compartidos dentro
          de FileVerseX.
        </p>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">

          <div className="flex flex-col items-center gap-3">

            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">
              Cargando publicaciones...
            </p>
          </div>
        </div>
      ) : publications.length ===
        0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">

          <FileText
            size={38}
            className="text-slate-300"
          />

          <h2 className="mt-4 font-semibold text-slate-900">
            No hay publicaciones
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Cuando tú u otros usuarios
            compartan contenido al que
            tengas acceso, aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl space-y-5">

          {publications.map(
            (publication) => {
              const ScopeIcon =
                getScopeIcon(
                  publication.alcance,
                )

              const ContentIcon =
                getContentIcon(
                  publication.tipo_contenido,
                )

              const isCommentsOpen =
                openComments[
                  publication
                    .id_publicacion
                ] ?? false

              const publicationComments =
                comments[
                  publication
                    .id_publicacion
                ] ?? []

              const authorName =
                publication.autor
                  ?.nombre_completo ??
                'Usuario'

              const isImage =
                publication.tipo_contenido ===
                  'archivo' &&
                Boolean(
                  publication.id_archivo,
                ) &&
                Boolean(
                  publication.tipo_mime?.startsWith(
                    'image/',
                  ),
                )

              return (
                <article
                  key={
                    publication.id_publicacion
                  }
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >

                  {/* AUTOR */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {getInitials(
                          authorName,
                        )}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-slate-900">
                          {
                            authorName
                          }
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          publicó un{' '}
                          {getContentTypeLabel(
                            publication,
                          )}
                          {' · '}
                          {formatDate(
                            publication.fecha_publicacion,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">

                      <ScopeIcon
                        size={14}
                      />

                      {getScopeLabel(
                        publication.alcance,
                      )}
                    </div>
                  </div>

                  {/* CONTENIDO */}
                  <div className="px-6 py-6">

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

                      {/* IMAGEN */}
                      {isImage &&
                        publication.id_archivo && (
                          <PublicationImagePreview
                            idArchivo={
                              publication.id_archivo
                            }
                            nombre={
                              publication.nombre_contenido
                            }
                          />
                        )}

                      {/* INFORMACIÓN */}
                      <div className="p-5">

                        <div className="flex items-start gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                            <ContentIcon
                              size={23}
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="break-words text-base font-semibold text-slate-900">
                              {
                                publication.nombre_contenido
                              }
                            </p>

                            <p className="mt-1 text-sm text-slate-500">

                              {publication.tipo_contenido ===
                              'archivo'
                                ? 'Archivo compartido'
                                : 'Colección compartida'}
                            </p>

                            {publication.tipo_mime && (
                              <p className="mt-2 text-xs text-slate-400">
                                {
                                  publication.tipo_mime
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACCIONES */}
                  <div className="flex items-center gap-6 border-t border-slate-100 px-6 py-4">

                    <button
                      type="button"
                      onClick={() =>
                        handleLike(
                          publication,
                        )
                      }
                      className={`flex items-center gap-2 text-sm font-medium transition ${
                        publication.usuario_dio_like
                          ? 'text-red-600'
                          : 'text-slate-500 hover:text-red-600'
                      }`}
                    >

                      <Heart
                        size={20}
                        fill={
                          publication.usuario_dio_like
                            ? 'currentColor'
                            : 'none'
                        }
                      />

                      {publication.total_likes ??
                        0}

                      <span>
                        Me gusta
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleComments(
                          publication.id_publicacion,
                        )
                      }
                      className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                    >

                      <MessageCircle
                        size={20}
                      />

                      {publication.total_comentarios ??
                        0}

                      <span>
                        Comentarios
                      </span>
                    </button>
                  </div>

                  {/* COMENTARIOS */}
                  {isCommentsOpen && (
                    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">

                      {loadingComments[
                        publication
                          .id_publicacion
                      ] ? (
                        <div className="flex justify-center py-5">

                          <div className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
                        </div>
                      ) : (
                        <div className="space-y-3">

                          {publicationComments.length ===
                          0 ? (
                            <p className="py-3 text-center text-sm text-slate-400">
                              Todavía no hay
                              comentarios.
                            </p>
                          ) : (
                            publicationComments.map(
                              (
                                comment,
                              ) => {
                                const commentAuthor =
                                  comment.usuario
                                    ?.nombre_completo ??
                                  `Usuario #${comment.id_usuario}`

                                return (
                                  <div
                                    key={
                                      comment.id_comentario
                                    }
                                    className="flex gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4"
                                  >

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">

                                      {getInitials(
                                        commentAuthor,
                                      )}
                                    </div>

                                    <div className="min-w-0 flex-1">

                                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">

                                        <p className="text-sm font-semibold text-slate-900">
                                          {
                                            commentAuthor
                                          }
                                        </p>

                                        <span className="text-xs text-slate-400">
                                          {formatDate(
                                            comment.fecha_comentario,
                                          )}
                                        </span>
                                      </div>

                                      <p className="mt-1 break-words text-sm leading-6 text-slate-700">
                                        {
                                          comment.contenido
                                        }
                                      </p>
                                    </div>
                                  </div>
                                )
                              },
                            )
                          )}

                          {/* NUEVO COMENTARIO */}
                          <div className="flex gap-2 pt-2">

                            <input
                              value={
                                commentText[
                                  publication
                                    .id_publicacion
                                ] ?? ''
                              }
                              onChange={(
                                event,
                              ) =>
                                setCommentText(
                                  (
                                    current,
                                  ) => ({
                                    ...current,

                                    [
                                      publication
                                        .id_publicacion
                                    ]:
                                      event
                                        .target
                                        .value,
                                  }),
                                )
                              }
                              onKeyDown={(
                                event,
                              ) => {
                                if (
                                  event.key ===
                                  'Enter'
                                ) {
                                  event.preventDefault()

                                  handleComment(
                                    publication,
                                  )
                                }
                              }}
                              placeholder="Escribe un comentario..."
                              maxLength={
                                1000
                              }
                              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                handleComment(
                                  publication,
                                )
                              }
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700"
                              title="Enviar comentario"
                            >
                              <Send
                                size={18}
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              )
            },
          )}
        </div>
      )}
    </div>
  )
}

/*
 * ============================================================
 * PREVISUALIZACIÓN DE IMÁGENES PUBLICADAS
 * ============================================================
 *
 * Como el endpoint /preview necesita JWT,
 * no podemos utilizar directamente la URL
 * dentro de <img>.
 *
 * Primero hacemos fetch con Bearer Token,
 * recibimos un Blob y creamos una URL local.
 * ============================================================
 */

interface PublicationImagePreviewProps {
  idArchivo: number
  nombre: string
}

function PublicationImagePreview({
  idArchivo,
  nombre,
}: PublicationImagePreviewProps) {
  const [
    imageUrl,
    setImageUrl,
  ] = useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  useEffect(() => {
    let objectUrl = ''
    let cancelled = false

    async function loadImage() {
      setIsLoading(true)
      setError('')
      setImageUrl('')

      try {
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

        const API_URL =
          import.meta.env.VITE_API_URL ??
          'http://localhost:3000/api/v1'

        const response =
          await fetch(
            `${API_URL}/files/${idArchivo}/preview`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            },
          )

        if (!response.ok) {
          let message =
            'No fue posible cargar la imagen'

          try {
            const result =
              await response.json()

            message =
              result?.error?.message ??
              message
          } catch {
            // La respuesta podría no ser JSON.
          }

          throw new Error(
            message,
          )
        }

        const blob =
          await response.blob()

        if (cancelled) {
          return
        }

        objectUrl =
          URL.createObjectURL(
            blob,
          )

        setImageUrl(
          objectUrl,
        )
      } catch (requestError) {
        if (cancelled) {
          return
        }

        setError(
          requestError instanceof Error
            ? requestError.message
            : 'No fue posible cargar la imagen',
        )
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadImage()

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(
          objectUrl,
        )
      }
    }
  }, [idArchivo])

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center bg-slate-100">

        <div className="flex flex-col items-center gap-3">

          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Cargando imagen...
          </p>
        </div>
      </div>
    )
  }

  if (
    error ||
    !imageUrl
  ) {
    return (
      <div className="flex min-h-52 items-center justify-center bg-slate-100 px-5 text-center">

        <div>
          <FileText
            size={32}
            className="mx-auto text-slate-300"
          />

          <p className="mt-3 text-sm text-slate-500">
            {error ||
              'No se pudo mostrar la imagen'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex max-h-[600px] justify-center overflow-hidden bg-slate-100">

      <img
        src={imageUrl}
        alt={nombre}
        className="max-h-[600px] w-full object-contain"
      />
    </div>
  )
}

export default PublicationsPage