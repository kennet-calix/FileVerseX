import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Globe2,
  LockKeyhole,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react'

import {
  createPublicationRequest,
  getPublicationRecipientsRequest,
  getPublicationsRequest,
  type Publication,
  type PublicationContentType,
  type PublicationScope,
} from '../services/publication.service'

import {
  getAvailableUsersRequest,
  type AvailableUser,
} from '../../users/services/user.service'

interface PublishModalProps {
  isOpen: boolean

  onClose: () => void

  tipoContenido:
    PublicationContentType

  idContenido: number

  nombreContenido: string

  onPublished?: () => void
}

function PublishModal({
  isOpen,
  onClose,
  tipoContenido,
  idContenido,
  nombreContenido,
  onPublished,
}: PublishModalProps) {
  const [
    alcance,
    setAlcance,
  ] =
    useState<PublicationScope>(
      'publica',
    )

  const [
    destinatarios,
    setDestinatarios,
  ] = useState<number[]>([])

  const [
    usuarios,
    setUsuarios,
  ] =
    useState<AvailableUser[]>(
      [],
    )

  const [
    searchUser,
    setSearchUser,
  ] = useState('')

  const [
    isLoadingUsers,
    setIsLoadingUsers,
  ] = useState(false)

  const [
    isLoadingPublication,
    setIsLoadingPublication,
  ] = useState(false)

  const [
    existingPublication,
    setExistingPublication,
  ] =
    useState<Publication | null>(
      null,
    )

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const [
    success,
    setSuccess,
  ] = useState('')

  /*
   * ============================================================
   * CARGAR PUBLICACIÓN EXISTENTE
   * ============================================================
   */
  useEffect(() => {
    if (!isOpen) {
      return
    }

    let cancelled = false

    async function loadExistingPublication() {
      setIsLoadingPublication(
        true,
      )

      setError('')
      setSuccess('')
      setSearchUser('')
      setExistingPublication(
        null,
      )

      /*
       * Valores por defecto
       * si el contenido todavía
       * no está publicado.
       */
      setAlcance('publica')
      setDestinatarios([])

      try {
        const publications =
          await getPublicationsRequest()

        if (cancelled) {
          return
        }

        const found =
          publications.find(
            (publication) => {
              if (
                publication.tipo_contenido !==
                tipoContenido
              ) {
                return false
              }

              if (
                tipoContenido ===
                'archivo'
              ) {
                return (
                  publication.id_archivo ===
                  idContenido
                )
              }

              return (
                publication.id_coleccion ===
                idContenido
              )
            },
          )

        if (!found) {
          return
        }

        setExistingPublication(
          found,
        )

        setAlcance(
          found.alcance,
        )

        /*
         * Si ya era dirigida,
         * recuperamos sus
         * destinatarios actuales.
         */
        if (
          found.alcance ===
          'dirigida'
        ) {
          const recipients =
            await getPublicationRecipientsRequest(
              found.id_publicacion,
            )

          if (cancelled) {
            return
          }

          setDestinatarios(
            recipients.map(
              (recipient) =>
                recipient.id_usuario,
            ),
          )
        }
      } catch (requestError) {
        if (cancelled) {
          return
        }

        if (
          requestError instanceof
          Error
        ) {
          setError(
            requestError.message,
          )
        } else {
          setError(
            'No fue posible obtener la publicación actual',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingPublication(
            false,
          )
        }
      }
    }

    loadExistingPublication()

    return () => {
      cancelled = true
    }
  }, [
    isOpen,
    tipoContenido,
    idContenido,
  ])

  /*
   * ============================================================
   * CARGAR USUARIOS CUANDO
   * EL ALCANCE ES DIRIGIDO
   * ============================================================
   */
  useEffect(() => {
    if (
      !isOpen ||
      alcance !== 'dirigida'
    ) {
      return
    }

    let cancelled = false

    async function loadUsers() {
      setIsLoadingUsers(true)
      setError('')

      try {
        const data =
          await getAvailableUsersRequest()

        if (!cancelled) {
          setUsuarios(data)
        }
      } catch (requestError) {
        if (cancelled) {
          return
        }

        if (
          requestError instanceof
          Error
        ) {
          setError(
            requestError.message,
          )
        } else {
          setError(
            'No fue posible obtener los usuarios',
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoadingUsers(
            false,
          )
        }
      }
    }

    loadUsers()

    return () => {
      cancelled = true
    }
  }, [
    isOpen,
    alcance,
  ])

  const usuariosFiltrados =
    useMemo(() => {
      const value =
        searchUser
          .toLowerCase()
          .trim()

      if (!value) {
        return usuarios
      }

      return usuarios.filter(
        (usuario) =>
          usuario.nombre_completo
            .toLowerCase()
            .includes(value) ||
          usuario.email
            .toLowerCase()
            .includes(value),
      )
    }, [
      usuarios,
      searchUser,
    ])

  if (!isOpen) {
    return null
  }

  function handleToggleUsuario(
    idUsuario: number,
  ) {
    setDestinatarios(
      (current) => {
        if (
          current.includes(
            idUsuario,
          )
        ) {
          return current.filter(
            (id) =>
              id !== idUsuario,
          )
        }

        return [
          ...current,
          idUsuario,
        ]
      },
    )
  }

  async function handlePublish() {
    setError('')
    setSuccess('')

    if (
      alcance === 'dirigida' &&
      destinatarios.length === 0
    ) {
      setError(
        'Selecciona al menos un destinatario',
      )

      return
    }

    setIsSubmitting(true)

    try {
      /*
       * El backend detecta si ya
       * existe una publicación
       * para este contenido.
       *
       * Si existe, la actualiza.
       * Si no existe, la crea.
       */
      await createPublicationRequest(
        tipoContenido,
        idContenido,
        alcance,
        alcance === 'dirigida'
          ? destinatarios
          : [],
      )

      setSuccess(
        existingPublication
          ? 'Publicación actualizada correctamente'
          : 'Publicación guardada correctamente',
      )

      onPublished?.()

      window.setTimeout(
        () => {
          onClose()
        },
        900,
      )
    } catch (requestError) {
      if (
        requestError instanceof
        Error
      ) {
        setError(
          requestError.message,
        )
      } else {
        setError(
          existingPublication
            ? 'No fue posible actualizar la publicación'
            : 'No fue posible publicar el contenido',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm">

      <div className="flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              FileVerseX
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-950">

              {existingPublication
                ? 'Actualizar publicación'
                : 'Publicar contenido'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">

              {existingPublication
                ? 'Modifica quién puede ver e interactuar con esta publicación.'
                : 'Define quién podrá ver e interactuar con esta publicación.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X
              size={20}
            />
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">

          {/* CARGANDO PUBLICACIÓN */}
          {isLoadingPublication ? (
            <div className="flex min-h-48 items-center justify-center">

              <div className="flex flex-col items-center gap-3">

                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="text-sm text-slate-500">
                  Comprobando publicación...
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* INFORMACIÓN DEL CONTENIDO */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">

                <div className="flex items-start justify-between gap-3">

                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Contenido
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold text-slate-900">
                      {
                        nombreContenido
                      }
                    </p>

                    <p className="mt-1 text-xs capitalize text-slate-500">
                      {
                        tipoContenido
                      }
                    </p>
                  </div>

                  {existingPublication && (
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Ya publicado
                    </span>
                  )}
                </div>
              </div>

              {/* VISIBILIDAD */}
              <div>

                <p className="mb-3 text-sm font-semibold text-slate-800">
                  Visibilidad
                </p>

                <div className="grid gap-3">

                  {/* PÚBLICA */}
                  <button
                    type="button"
                    onClick={() => {
                      setAlcance(
                        'publica',
                      )

                      setDestinatarios(
                        [],
                      )
                    }}
                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      alcance ===
                      'publica'
                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        alcance ===
                        'publica'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Globe2
                        size={20}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Pública
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Todos los usuarios de
                        FileVerseX podrán verla
                        e interactuar.
                      </p>
                    </div>
                  </button>

                  {/* DIRIGIDA */}
                  <button
                    type="button"
                    onClick={() =>
                      setAlcance(
                        'dirigida',
                      )
                    }
                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      alcance ===
                      'dirigida'
                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        alcance ===
                        'dirigida'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Users
                        size={20}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Dirigida
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Solo los usuarios que
                        selecciones podrán
                        acceder.
                      </p>
                    </div>
                  </button>

                  {/* PRIVADA */}
                  <button
                    type="button"
                    onClick={() => {
                      setAlcance(
                        'privada',
                      )

                      setDestinatarios(
                        [],
                      )
                    }}
                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition ${
                      alcance ===
                      'privada'
                        ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        alcance ===
                        'privada'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <LockKeyhole
                        size={20}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Privada
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Solo tú podrás
                        visualizar esta
                        publicación.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {/* DESTINATARIOS */}
              {alcance ===
                'dirigida' && (
                <div>

                  <div className="mb-3 flex items-center justify-between">

                    <p className="text-sm font-semibold text-slate-800">
                      Destinatarios
                    </p>

                    <span className="text-xs font-medium text-blue-600">
                      {
                        destinatarios.length
                      }{' '}
                      seleccionado(s)
                    </span>
                  </div>

                  {/* BUSCADOR */}
                  <div className="relative mb-3">

                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      value={
                        searchUser
                      }
                      onChange={(
                        event,
                      ) =>
                        setSearchUser(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Buscar por nombre o correo..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center rounded-2xl border border-slate-200 py-8">

                      <div className="flex flex-col items-center gap-3">

                        <div className="h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                        <p className="text-sm text-slate-500">
                          Cargando usuarios...
                        </p>
                      </div>
                    </div>
                  ) : usuariosFiltrados.length >
                    0 ? (
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2">

                      {usuariosFiltrados.map(
                        (
                          usuario,
                        ) => {
                          const selected =
                            destinatarios.includes(
                              usuario.id_usuario,
                            )

                          return (
                            <button
                              key={
                                usuario.id_usuario
                              }
                              type="button"
                              onClick={() =>
                                handleToggleUsuario(
                                  usuario.id_usuario,
                                )
                              }
                              className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition ${
                                selected
                                  ? 'bg-blue-50 ring-1 ring-blue-200'
                                  : 'hover:bg-slate-50'
                              }`}
                            >

                              <div className="flex min-w-0 items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold uppercase text-slate-600">

                                  {usuario.nombre_completo
                                    .trim()
                                    .charAt(
                                      0,
                                    ) ||
                                    '?'}
                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-semibold text-slate-900">
                                    {
                                      usuario.nombre_completo
                                    }
                                  </p>

                                  <p className="truncate text-xs text-slate-500">
                                    {
                                      usuario.email
                                    }
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`ml-4 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                  selected
                                    ? 'border-blue-600 bg-blue-600'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {selected && (
                                  <span className="text-xs font-bold text-white">
                                    ✓
                                  </span>
                                )}
                              </div>
                            </button>
                          )
                        },
                      )}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">

                      <Users
                        size={28}
                        className="mx-auto text-slate-300"
                      />

                      <p className="mt-3 text-sm text-slate-500">
                        No se encontraron
                        usuarios disponibles.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* ERROR */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={
              handlePublish
            }
            disabled={
              isSubmitting ||
              isLoadingPublication
            }
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                {existingPublication
                  ? 'Actualizando...'
                  : 'Publicando...'}
              </>
            ) : (
              <>
                <Send
                  size={17}
                />

                {existingPublication
                  ? 'Actualizar publicación'
                  : 'Publicar'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublishModal