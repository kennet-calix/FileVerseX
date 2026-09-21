import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowRight,
  BarChart3,
  Download,
  FileText,
  Folder,
  FolderPlus,
  LayoutDashboard,
  Plus,
  ShieldCheck,
  Upload,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

import {
  getFilesRequest,
  type FileItem,
} from '../../features/files/services/file.service'

import {
  getCollectionsRequest,
  type CollectionItem,
} from '../../features/collections/services/collection.service'
import {
  getMyStatisticsRequest,
  type UserStatistics,
} from '../../features/statistics/services/statistics.service'

import {
  useAuth,
} from '../../features/auth/hooks/useAuth'

/*
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

function DashboardPage() {
  const { user } = useAuth()

  const [
    files,
    setFiles,
  ] = useState<FileItem[]>([])

  const [
    collections,
    setCollections,
  ] = useState<CollectionItem[]>([])

  const [
    statistics,
    setStatistics,
  ] = useState<UserStatistics | null>(
    null,
  )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  )

  /*
   * ==========================================================
   * CARGAR INFORMACIÓN
   * ==========================================================
   */

  useEffect(() => {
    void loadDashboard()
  }, [])

  async function loadDashboard() {
    setIsLoading(true)
    setError(null)

    try {
      const [
        filesData,
        collectionsData,
        statisticsData,
      ] = await Promise.all([
        getFilesRequest(),
        getCollectionsRequest(),
        getMyStatisticsRequest(),
      ])

      setFiles(filesData)
      setCollections(collectionsData)
      setStatistics(statisticsData)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError(
          'No fue posible cargar el dashboard',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  /*
   * ==========================================================
   * NOMBRE DEL USUARIO
   * ==========================================================
   */

  const firstName =
    user?.nombre_completo
      ?.trim()
      .split(/\s+/)[0] ??
    'Usuario'

  /*
   * ==========================================================
   * ARCHIVOS RECIENTES
   * ==========================================================
   */

  const recentFiles =
    useMemo(() => {
      return [...files]
        .sort((a, b) => {
          const dateA =
            a.fecha_subida
              ? new Date(
                  a.fecha_subida,
                ).getTime()
              : 0

          const dateB =
            b.fecha_subida
              ? new Date(
                  b.fecha_subida,
                ).getTime()
              : 0

          return dateB - dateA
        })
        .slice(0, 4)
    }, [files])

  /*
   * ==========================================================
   * COLECCIONES RECIENTES
   * ==========================================================
   */

  const recentCollections =
    useMemo(() => {
      return [...collections]
        .sort((a, b) => {
          const dateA =
            a.fecha_creacion
              ? new Date(
                  a.fecha_creacion,
                ).getTime()
              : 0

          const dateB =
            b.fecha_creacion
              ? new Date(
                  b.fecha_creacion,
                ).getTime()
              : 0

          return dateB - dateA
        })
        .slice(0, 3)
    }, [collections])

  /*
   * ==========================================================
   * FORMATEAR FECHA
   * ==========================================================
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
      },
    ).format(
      new Date(date),
    )
  }

  /*
   * ==========================================================
   * FORMATEAR TAMAÑO
   * ==========================================================
   */

  function formatFileSize(
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

  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Cargando dashboard...
          </p>
        </div>
      </div>
    )
  }

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (
    error ||
    !statistics
  ) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-700">
            No fue posible cargar el
            dashboard
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error ??
              'No se recibió información de estadísticas.'}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadDashboard()
            }
            className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  /*
   * ==========================================================
   * TARJETAS
   * ==========================================================
   */

  const cards = [
    {
      title: 'Mis archivos',
      value:
        statistics.resumen
          .total_archivos,
      description:
        'Archivos almacenados',
      icon: FileText,
    },
    {
      title: 'Mis colecciones',
      value: collections.length,
      description:
        'Colecciones creadas',
      icon: Folder,
    },
    {
      title:
        'Publicaciones activas',
      value:
        statistics.resumen
          .total_publicaciones,
      description:
        'Contenido publicado',
      icon: LayoutDashboard,
    },
    {
      title: 'Descargas',
      value:
        statistics.resumen
          .total_descargas,
      description:
        'Descargas acumuladas',
      icon: Download,
    },
  ]

  return (
    <div className="space-y-7">
      {/* ======================================================
          ENCABEZADO
      ====================================================== */}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative p-6 sm:p-8">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-50" />

          <div className="absolute -right-4 top-12 h-32 w-32 rounded-full bg-indigo-50" />

          <div className="relative max-w-2xl">
            <p className="text-sm font-semibold text-blue-600">
              Resumen general
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Bienvenido, {firstName}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Aquí tienes un resumen de
              tu actividad reciente en
              FileVerseX.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/files"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Upload size={17} />

                Subir archivo
              </Link>

              <Link
                to="/collections"
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <FolderPlus
                  size={17}
                />

                Crear colección
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MÉTRICAS
      ====================================================== */}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon =
            card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                    {card.value}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon
                    size={21}
                  />
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                {card.description}
              </p>
            </div>
          )
        })}
      </section>

      {/* ======================================================
          CONTENIDO
      ====================================================== */}

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        {/* ====================================================
            ARCHIVOS RECIENTES
        ==================================================== */}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 className="font-semibold text-slate-950">
                Archivos recientes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Tus últimos archivos
                subidos.
              </p>
            </div>

            <Link
              to="/files"
              className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
            >
              Ver todos

              <ArrowRight
                size={16}
              />
            </Link>
          </div>

          {recentFiles.length ===
          0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <FileText
                  size={22}
                />
              </div>

              <p className="mt-4 font-semibold text-slate-700">
                No tienes archivos
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Sube tu primer archivo
                para comenzar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentFiles.map(
                (file) => (
                  <div
                    key={
                      file.id_archivo
                    }
                    className="flex items-center gap-4 px-6 py-4 transition hover:bg-slate-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FileText
                        size={20}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {
                          file.nombre_original
                        }
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>
                          {formatFileSize(
                            file.tamano_bytes,
                          )}
                        </span>

                        <span>
                          {formatDate(
                            file.fecha_subida,
                          )}
                        </span>

                        <span>
                          {
                            file.contador_descargas ??
                            0
                          }{' '}
                          descargas
                        </span>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        file.estado ===
                        'activo'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {file.estado ===
                      'activo'
                        ? 'Activo'
                        : 'Restringido'}
                    </span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        {/* ====================================================
            COLUMNA DERECHA
        ==================================================== */}

        <div className="space-y-6">
          {/* ACCIONES RÁPIDAS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">
              Acciones rápidas
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Accede rápidamente a las
              funciones principales.
            </p>

            <div className="mt-5 grid gap-3">
              <Link
                to="/files"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Plus
                    size={19}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                    Subir archivo
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Agrega nuevo
                    contenido
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </Link>

              <Link
                to="/collections"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FolderPlus
                    size={19}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                    Crear colección
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Organiza tus
                    archivos
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </Link>

              <Link
                to="/publications"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <LayoutDashboard
                    size={19}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                    Ver publicaciones
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Explora contenido
                    publicado
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </Link>

              <Link
                to="/statistics"
                className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3.5 transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BarChart3
                    size={19}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">
                    Estadísticas
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Consulta tus
                    métricas
                  </p>
                </div>

                <ArrowRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600"
                />
              </Link>
            </div>
          </div>

          {/* ADMINISTRACIÓN */}

          {user?.id_rol === 1 && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <ShieldCheck
                  size={21}
                />
              </div>

              <h2 className="mt-4 font-semibold text-slate-950">
                Panel de
                administración
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Gestiona usuarios,
                archivos y las
                herramientas de
                moderación del sistema.
              </p>

              <Link
                to="/admin"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Ir a Administración

                <ArrowRight
                  size={16}
                />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          COLECCIONES RECIENTES
      ====================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-950">
              Colecciones recientes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tus colecciones creadas
              recientemente.
            </p>
          </div>

          <Link
            to="/collections"
            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            Ver colecciones

            <ArrowRight
              size={16}
            />
          </Link>
        </div>

        {recentCollections.length ===
        0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Folder
                size={22}
              />
            </div>

            <p className="mt-4 font-semibold text-slate-700">
              No tienes colecciones
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Crea una colección para
              organizar tus archivos.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
            {recentCollections.map(
              (collection) => (
                <Link
                  key={
                    collection.id_coleccion
                  }
                  to={`/collections/${collection.id_coleccion}`}
                  className="group rounded-2xl border border-slate-200 p-5 transition hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Folder
                      size={20}
                    />
                  </div>

                  <h3 className="mt-4 truncate font-semibold text-slate-900 transition group-hover:text-blue-700">
                    {
                      collection.nombre
                    }
                  </h3>

                  <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                    {collection.descripcion ??
                      'Sin descripción'}
                  </p>

                  <p className="mt-4 text-xs text-slate-400">
                    Creada el{' '}
                    {formatDate(
                      collection.fecha_creacion,
                    )}
                  </p>
                </Link>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  )
}

export default DashboardPage