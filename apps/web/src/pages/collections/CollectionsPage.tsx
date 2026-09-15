import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  CheckCircle2,
  Edit3,
  Folder,
  FolderPlus,
  Search,
  Share2,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'

import { useNavigate } from 'react-router-dom'

import {
  createCollectionRequest,
  deleteCollectionRequest,
  getCollectionsRequest,
  type CollectionItem,
  updateCollectionRequest,
} from '../../features/collections/services/collection.service'

import PublishModal from '../../features/publications/components/PublishModal'

type ToastType =
  | 'success'
  | 'error'

interface ToastState {
  message: string
  type: ToastType
}

function CollectionsPage() {
  const navigate =
    useNavigate()

  const [
    collections,
    setCollections,
  ] =
    useState<CollectionItem[]>(
      [],
    )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false)

  const [
    collectionToEdit,
    setCollectionToEdit,
  ] =
    useState<CollectionItem | null>(
      null,
    )

  const [
    collectionToDelete,
    setCollectionToDelete,
  ] =
    useState<CollectionItem | null>(
      null,
    )

  const [
    collectionToPublish,
    setCollectionToPublish,
  ] =
    useState<CollectionItem | null>(
      null,
    )

  const [
    nombre,
    setNombre,
  ] = useState('')

  const [
    descripcion,
    setDescripcion,
  ] = useState('')

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false)

  const [
    toast,
    setToast,
  ] =
    useState<ToastState | null>(
      null,
    )

  useEffect(() => {
    loadCollections()
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

  async function loadCollections() {
    setIsLoading(true)

    try {
      const data =
        await getCollectionsRequest()

      setCollections(data)
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
          'No fue posible obtener las colecciones',
          'error',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setNombre('')
    setDescripcion('')
  }

  function openCreateModal() {
    resetForm()

    setCollectionToEdit(
      null,
    )

    setShowCreateModal(
      true,
    )
  }

  function openEditModal(
    collection:
      CollectionItem,
  ) {
    setCollectionToEdit(
      collection,
    )

    setNombre(
      collection.nombre,
    )

    setDescripcion(
      collection.descripcion ??
        '',
    )

    setShowCreateModal(
      true,
    )
  }

  function closeFormModal() {
    if (isSaving) {
      return
    }

    setShowCreateModal(
      false,
    )

    setCollectionToEdit(
      null,
    )

    resetForm()
  }

  async function handleSaveCollection() {
    const cleanName =
      nombre.trim()

    if (!cleanName) {
      showToast(
        'El nombre de la colección es obligatorio',
        'error',
      )

      return
    }

    setIsSaving(true)

    try {
      if (
        collectionToEdit
      ) {
        const updated =
          await updateCollectionRequest(
            collectionToEdit
              .id_coleccion,
            cleanName,
            descripcion,
          )

        setCollections(
          (current) =>
            current.map(
              (collection) =>
                collection
                  .id_coleccion ===
                updated
                  .id_coleccion
                  ? updated
                  : collection,
            ),
        )

        showToast(
          'Colección actualizada correctamente',
          'success',
        )
      } else {
        const created =
          await createCollectionRequest(
            cleanName,
            descripcion,
          )

        setCollections(
          (current) => [
            created,
            ...current,
          ],
        )

        showToast(
          'Colección creada correctamente',
          'success',
        )
      }

      setShowCreateModal(
        false,
      )

      setCollectionToEdit(
        null,
      )

      resetForm()
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
          'No fue posible guardar la colección',
          'error',
        )
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteCollection() {
    if (
      !collectionToDelete
    ) {
      return
    }

    setIsDeleting(true)

    try {
      await deleteCollectionRequest(
        collectionToDelete
          .id_coleccion,
      )

      setCollections(
        (current) =>
          current.filter(
            (collection) =>
              collection
                .id_coleccion !==
              collectionToDelete
                .id_coleccion,
          ),
      )

      showToast(
        'Colección eliminada correctamente',
        'success',
      )

      setCollectionToDelete(
        null,
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
          'No fue posible eliminar la colección',
          'error',
        )
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredCollections =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase()

      if (!value) {
        return collections
      }

      return collections.filter(
        (collection) =>
          collection.nombre
            .toLowerCase()
            .includes(value) ||
          collection.descripcion
            ?.toLowerCase()
            .includes(value),
      )
    }, [
      collections,
      search,
    ])

  function formatDate(
    date: string | null,
  ) {
    if (!date) {
      return 'Sin fecha'
    }

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
              <X
                size={18}
              />
            </button>
          </div>
        </div>
      )}

      {/* ENCABEZADO */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            Organización
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Colecciones
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Organiza tus archivos en grupos
            personalizados.
          </p>
        </div>

        <button
          type="button"
          onClick={
            openCreateModal
          }
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <FolderPlus
            size={18}
          />

          Nueva colección
        </button>
      </div>

      {/* RESUMEN */}
      <div className="grid gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Total de colecciones
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              collections.length
            }
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <p className="text-sm text-slate-500">
            Resultado de búsqueda
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-950">
            {
              filteredCollections.length
            }
          </p>
        </div>
      </div>

      {/* BUSCADOR */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="relative max-w-md">

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
            placeholder="Buscar colección..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* LISTADO */}
      {isLoading ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">

          <div className="flex flex-col items-center gap-3">

            <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="text-sm text-slate-500">
              Cargando colecciones...
            </p>
          </div>
        </div>
      ) : filteredCollections.length ===
        0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center shadow-sm">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">

            <Folder
              size={30}
            />
          </div>

          <h2 className="mt-5 text-lg font-semibold text-slate-900">

            {search
              ? 'No se encontraron colecciones'
              : 'Aún no tienes colecciones'}
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500">

            {search
              ? 'Prueba con otro nombre o descripción.'
              : 'Crea una colección para organizar tus archivos por proyectos, materias o categorías.'}
          </p>

          {!search && (
            <button
              type="button"
              onClick={
                openCreateModal
              }
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <FolderPlus
                size={17}
              />

              Crear colección
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

          {filteredCollections.map(
            (
              collection,
            ) => (
              <div
                key={
                  collection.id_coleccion
                }
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >

                <div className="flex items-start justify-between gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                    <Folder
                      size={23}
                    />
                  </div>

                  {/* ACCIONES */}
                  <div className="flex items-center gap-1">

                    {/* PUBLICAR */}
                    <button
                      type="button"
                      onClick={() =>
                        setCollectionToPublish(
                          collection,
                        )
                      }
                      title="Publicar colección"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Share2
                        size={17}
                      />
                    </button>

                    {/* EDITAR */}
                    <button
                      type="button"
                      onClick={() =>
                        openEditModal(
                          collection,
                        )
                      }
                      title="Editar colección"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Edit3
                        size={17}
                      />
                    </button>

                    {/* ELIMINAR */}
                    <button
                      type="button"
                      onClick={() =>
                        setCollectionToDelete(
                          collection,
                        )
                      }
                      title="Eliminar colección"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2
                        size={17}
                      />
                    </button>
                  </div>
                </div>

                <h2 className="mt-5 truncate text-lg font-semibold text-slate-950">
                  {
                    collection.nombre
                  }
                </h2>

                <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">
                  {collection.descripcion ||
                    'Sin descripción'}
                </p>

                <div className="mt-5 border-t border-slate-100 pt-4">

                  <p className="text-xs text-slate-400">
                    Creada el{' '}
                    {formatDate(
                      collection.fecha_creacion,
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        `/collections/${collection.id_coleccion}`,
                      )
                    }
                    className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    Abrir colección
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      {/* MODAL DE PUBLICACIÓN */}
      {collectionToPublish && (
        <PublishModal
          isOpen={true}
          onClose={() =>
            setCollectionToPublish(
              null,
            )
          }
          tipoContenido="coleccion"
          idContenido={
            collectionToPublish
              .id_coleccion
          }
          nombreContenido={
            collectionToPublish
              .nombre
          }
          onPublished={() => {
            showToast(
              'Colección publicada correctamente',
              'success',
            )
          }}
        />
      )}

      {/* MODAL CREAR / EDITAR */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

            <div className="flex items-start justify-between gap-4">

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                  {collectionToEdit ? (
                    <Edit3
                      size={22}
                    />
                  ) : (
                    <FolderPlus
                      size={22}
                    />
                  )}
                </div>

                <h2 className="mt-4 text-xl font-bold text-slate-950">

                  {collectionToEdit
                    ? 'Editar colección'
                    : 'Nueva colección'}
                </h2>
              </div>

              <button
                type="button"
                disabled={
                  isSaving
                }
                onClick={
                  closeFormModal
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X
                  size={19}
                />
              </button>
            </div>

            <div className="mt-6 space-y-5">

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Nombre
                </label>

                <input
                  value={
                    nombre
                  }
                  maxLength={
                    150
                  }
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
                  placeholder="Ej. Documentos académicos"
                  className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Descripción
                </label>

                <textarea
                  value={
                    descripcion
                  }
                  maxLength={
                    500
                  }
                  rows={4}
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
                  placeholder="Describe el propósito de esta colección..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                disabled={
                  isSaving
                }
                onClick={
                  closeFormModal
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={
                  isSaving
                }
                onClick={
                  handleSaveCollection
                }
                className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >

                {isSaving
                  ? 'Guardando...'
                  : collectionToEdit
                    ? 'Guardar cambios'
                    : 'Crear colección'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR */}
      {collectionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">

              <Trash2
                size={22}
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Eliminar colección
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              ¿Estás seguro de que
              deseas eliminar{' '}

              <span className="font-semibold text-slate-700">
                {
                  collectionToDelete.nombre
                }
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Los archivos no serán
              eliminados de tu cuenta.
            </p>

            <div className="mt-6 flex justify-end gap-3">

              <button
                type="button"
                disabled={
                  isDeleting
                }
                onClick={() =>
                  setCollectionToDelete(
                    null,
                  )
                }
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={
                  isDeleting
                }
                onClick={
                  handleDeleteCollection
                }
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
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

export default CollectionsPage