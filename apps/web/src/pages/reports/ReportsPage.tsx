import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  ArrowRight,
  Download,
  FileClock,
  FileJson,
  FileSpreadsheet,
  FileText,
  Filter,
  Folder,
  Globe2,
  Heart,
  LockKeyhole,
  MessageCircle,
  Search,
  Users,
} from 'lucide-react'

import {
  getTraceabilityReportRequest,
  type TraceabilityItem,
  type TraceabilityReport,
} from '../../features/reports/services/report.service'

function ReportsPage() {
  const [
    report,
    setReport,
  ] =
    useState<TraceabilityReport | null>(
      null,
    )

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState('')

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<
      | 'todos'
      | 'archivo'
      | 'coleccion'
    >('todos')

  useEffect(() => {
    loadReport()
  }, [])

  async function loadReport() {
    setIsLoading(true)
    setError('')

    try {
      const data =
        await getTraceabilityReportRequest()

      setReport(data)
    } catch (requestError) {
      if (
        requestError instanceof Error
      ) {
        setError(
          requestError.message,
        )
      } else {
        setError(
          'No fue posible obtener el reporte',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  /*
   * ============================================================
   * FILTROS
   * ============================================================
   */
  const filteredHistory =
    useMemo(() => {
      if (!report) {
        return []
      }

      const value =
        search
          .trim()
          .toLowerCase()

      return report.historial.filter(
        (item) => {
          const matchesSearch =
            !value ||
            item.nombre_contenido
              .toLowerCase()
              .includes(value)

          const matchesType =
            typeFilter ===
              'todos' ||
            item.tipo_contenido ===
              typeFilter

          return (
            matchesSearch &&
            matchesType
          )
        },
      )
    }, [
      report,
      search,
      typeFilter,
    ])

  /*
   * ============================================================
   * EXPORTAR JSON
   * ============================================================
   */
  function exportJson() {
    if (
      filteredHistory.length ===
      0
    ) {
      return
    }

    const exportData = {
      generado_en:
        new Date().toISOString(),

      filtros: {
        busqueda:
          search || null,

        tipo:
          typeFilter,
      },

      total_registros:
        filteredHistory.length,

      historial:
        filteredHistory,
    }

    const content =
      JSON.stringify(
        exportData,
        null,
        2,
      )

    downloadFile(
      content,
      createFileName(
        'json',
      ),
      'application/json;charset=utf-8',
    )
  }

  /*
   * ============================================================
   * EXPORTAR CSV
   * ============================================================
   */
  function exportCsv() {
    if (
      filteredHistory.length ===
      0
    ) {
      return
    }

    const headers = [
      'ID Historial',
      'ID Publicación',
      'Tipo de contenido',
      'ID Contenido',
      'Nombre del contenido',
      'Alcance anterior',
      'Alcance nuevo',
      'Destinatarios',
      'Likes acumulados',
      'Comentarios acumulados',
      'Fecha del cambio',
    ]

    const rows =
      filteredHistory.map(
        (item) => [
          item.id_historial,
          item.id_publicacion,

          formatContentType(
            item.tipo_contenido,
          ),

          item.id_contenido ??
            '',

          item.nombre_contenido,

          formatScope(
            item.alcance_anterior,
          ),

          formatScope(
            item.alcance_nuevo,
          ),

          formatRecipients(
            item,
          ),

          item.likes_acumulados,

          item.comentarios_acumulados,

          formatDate(
            item.fecha_cambio,
          ),
        ],
      )

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            escapeCsv(
              String(value),
            ),
          )
          .join(','),
      )
      .join('\n')

    /*
     * BOM para que Excel reconozca
     * correctamente tildes y ñ.
     */
    downloadFile(
      `\uFEFF${csvContent}`,
      createFileName(
        'csv',
      ),
      'text/csv;charset=utf-8',
    )
  }

  /*
   * ============================================================
   * EXPORTAR TXT
   * ============================================================
   */
  function exportTxt() {
    if (
      filteredHistory.length ===
      0
    ) {
      return
    }

    const lines: string[] = [
      'FILEVERSEX',
      'REPORTE DE TRAZABILIDAD',
      '',
      `Fecha de generación: ${formatDate(
        new Date().toISOString(),
      )}`,
      `Total de registros exportados: ${filteredHistory.length}`,
      '',
      '============================================================',
      '',
    ]

    filteredHistory.forEach(
      (
        item,
        index,
      ) => {
        lines.push(
          `REGISTRO ${index + 1}`,
        )

        lines.push(
          `ID Historial: ${item.id_historial}`,
        )

        lines.push(
          `ID Publicación: ${item.id_publicacion}`,
        )

        lines.push(
          `Tipo: ${formatContentType(
            item.tipo_contenido,
          )}`,
        )

        lines.push(
          `Contenido: ${item.nombre_contenido}`,
        )

        lines.push(
          `Cambio: ${formatScope(
            item.alcance_anterior,
          )} -> ${formatScope(
            item.alcance_nuevo,
          )}`,
        )

        lines.push(
          `Destinatarios: ${formatRecipients(
            item,
          )}`,
        )

        lines.push(
          `Likes acumulados: ${item.likes_acumulados}`,
        )

        lines.push(
          `Comentarios acumulados: ${item.comentarios_acumulados}`,
        )

        lines.push(
          `Fecha del cambio: ${formatDate(
            item.fecha_cambio,
          )}`,
        )

        lines.push(
          '',
          '------------------------------------------------------------',
          '',
        )
      },
    )

    downloadFile(
      lines.join('\n'),
      createFileName(
        'txt',
      ),
      'text/plain;charset=utf-8',
    )
  }

  /*
   * ============================================================
   * CARGANDO
   * ============================================================
   */
  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-col items-center gap-3">

          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Cargando reporte...
          </p>
        </div>
      </div>
    )
  }

  /*
   * ============================================================
   * ERROR
   * ============================================================
   */
  if (
    error ||
    !report
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

        <p className="text-sm font-medium text-red-700">
          {error ||
            'No fue posible cargar el reporte'}
        </p>

        <button
          type="button"
          onClick={
            loadReport
          }
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

        <div>

          <p className="text-sm font-semibold text-blue-600">
            Trazabilidad
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Reportes
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Consulta el historial de cambios
            de tus publicaciones.
          </p>
        </div>

        {/* EXPORTAR */}
        <div className="flex flex-wrap items-center gap-2">

          <div className="mr-1 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Download
              size={17}
            />

            Exportar
          </div>

          <button
            type="button"
            onClick={
              exportCsv
            }
            disabled={
              filteredHistory.length ===
              0
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileSpreadsheet
              size={17}
            />

            CSV
          </button>

          <button
            type="button"
            onClick={
              exportTxt
            }
            disabled={
              filteredHistory.length ===
              0
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText
              size={17}
            />

            TXT
          </button>

          <button
            type="button"
            onClick={
              exportJson
            }
            disabled={
              filteredHistory.length ===
              0
            }
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileJson
              size={17}
            />

            JSON
          </button>
        </div>
      </div>

      {/* RESUMEN */}
      <div className="grid gap-4 md:grid-cols-2">

        <SummaryCard
          title="Cambios registrados"
          value={
            report.resumen
              .total_cambios
          }
          icon={FileClock}
        />

        <SummaryCard
          title="Publicaciones con historial"
          value={
            report.resumen
              .publicaciones_con_historial
          }
          icon={FileText}
        />
      </div>

      {/* FILTROS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div className="relative w-full max-w-md">

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
              placeholder="Buscar archivo o colección..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex items-center gap-2">

            <Filter
              size={17}
              className="text-slate-400"
            />

            <select
              value={
                typeFilter
              }
              onChange={(
                event,
              ) =>
                setTypeFilter(
                  event.target
                    .value as
                    | 'todos'
                    | 'archivo'
                    | 'coleccion',
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="todos">
                Todos
              </option>

              <option value="archivo">
                Archivos
              </option>

              <option value="coleccion">
                Colecciones
              </option>
            </select>
          </div>
        </div>

        <div className="mt-4 border-t border-slate-100 pt-4">

          <p className="text-xs text-slate-400">
            Mostrando{' '}
            <span className="font-semibold text-slate-600">
              {
                filteredHistory.length
              }
            </span>{' '}
            de{' '}
            <span className="font-semibold text-slate-600">
              {
                report.historial.length
              }
            </span>{' '}
            registros.
          </p>
        </div>
      </div>

      {/* HISTORIAL */}
      {filteredHistory.length ===
      0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 text-center">

          <FileClock
            size={38}
            className="text-slate-300"
          />

          <h2 className="mt-4 font-semibold text-slate-900">
            No hay registros
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            No encontramos cambios de
            trazabilidad con los filtros
            actuales.
          </p>
        </div>
      ) : (
        <div className="space-y-5">

          {filteredHistory.map(
            (item) => (
              <TraceabilityCard
                key={
                  item.id_historial
                }
                item={item}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}

/*
 * ============================================================
 * TARJETA DE RESUMEN
 * ============================================================
 */
interface SummaryCardProps {
  title: string
  value: number

  icon: React.ComponentType<{
    size?: number
  }>
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon
            size={21}
          />
        </div>

        <p className="text-3xl font-bold text-slate-950">
          {value}
        </p>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">
        {title}
      </p>
    </div>
  )
}

/*
 * ============================================================
 * TARJETA DE TRAZABILIDAD
 * ============================================================
 */
interface TraceabilityCardProps {
  item: TraceabilityItem
}

function TraceabilityCard({
  item,
}: TraceabilityCardProps) {
  const ContentIcon =
    item.tipo_contenido ===
    'coleccion'
      ? Folder
      : FileText

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* CABECERA */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

            <ContentIcon
              size={22}
            />
          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">

              {item.tipo_contenido ===
              'coleccion'
                ? 'Colección'
                : 'Archivo'}
            </p>

            <h2 className="mt-1 break-words text-lg font-semibold text-slate-950">
              {
                item.nombre_contenido
              }
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {formatDate(
                item.fecha_cambio,
              )}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          Historial #
          {item.id_historial}
        </span>
      </div>

      {/* CAMBIO DE ALCANCE */}
      <div className="mt-6 rounded-2xl bg-slate-50 p-5">

        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Cambio de alcance
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">

          <ScopeBadge
            scope={
              item.alcance_anterior
            }
            emptyLabel="Creación"
          />

          <ArrowRight
            size={18}
            className="text-slate-400"
          />

          <ScopeBadge
            scope={
              item.alcance_nuevo
            }
          />
        </div>
      </div>

      {/* MÉTRICAS */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-4">

          <Heart
            size={19}
            className="text-red-500"
          />

          <div>
            <p className="text-xs text-slate-500">
              Likes acumulados
            </p>

            <p className="text-lg font-bold text-slate-900">
              {
                item.likes_acumulados
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-4">

          <MessageCircle
            size={19}
            className="text-blue-500"
          />

          <div>
            <p className="text-xs text-slate-500">
              Comentarios acumulados
            </p>

            <p className="text-lg font-bold text-slate-900">
              {
                item.comentarios_acumulados
              }
            </p>
          </div>
        </div>
      </div>

      {/* DESTINATARIOS */}
      {item.alcance_nuevo ===
        'dirigida' && (
        <div className="mt-5">

          <div className="flex items-center gap-2">

            <Users
              size={18}
              className="text-slate-500"
            />

            <p className="text-sm font-semibold text-slate-800">
              Destinatarios
            </p>
          </div>

          {item.destinatarios.length >
          0 ? (
            <div className="mt-3 grid gap-3 md:grid-cols-2">

              {item.destinatarios.map(
                (recipient) => (
                  <div
                    key={
                      recipient.id_usuario
                    }
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {
                        recipient.nombre_completo
                      }
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {
                        recipient.email
                      }
                    </p>
                  </div>
                ),
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">
              No existen destinatarios
              registrados para este cambio.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/*
 * ============================================================
 * BADGE DE ALCANCE
 * ============================================================
 */
function ScopeBadge({
  scope,
  emptyLabel = 'Sin alcance',
}: {
  scope:
    | 'publica'
    | 'dirigida'
    | 'privada'
    | null

  emptyLabel?: string
}) {
  if (!scope) {
    return (
      <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
        {emptyLabel}
      </span>
    )
  }

  if (
    scope === 'publica'
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
        <Globe2
          size={14}
        />

        Pública
      </span>
    )
  }

  if (
    scope === 'dirigida'
  ) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
        <Users
          size={14}
        />

        Dirigida
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
      <LockKeyhole
        size={14}
      />

      Privada
    </span>
  )
}

/*
 * ============================================================
 * FORMATEAR FECHA
 * ============================================================
 */
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

/*
 * ============================================================
 * FORMATEAR ALCANCE
 * ============================================================
 */
function formatScope(
  scope:
    | 'publica'
    | 'dirigida'
    | 'privada'
    | null,
) {
  if (!scope) {
    return 'Creación'
  }

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

/*
 * ============================================================
 * FORMATEAR TIPO DE CONTENIDO
 * ============================================================
 */
function formatContentType(
  type:
    | 'archivo'
    | 'coleccion'
    | null,
) {
  if (
    type === 'archivo'
  ) {
    return 'Archivo'
  }

  if (
    type === 'coleccion'
  ) {
    return 'Colección'
  }

  return 'No disponible'
}

/*
 * ============================================================
 * FORMATEAR DESTINATARIOS
 * ============================================================
 */
function formatRecipients(
  item: TraceabilityItem,
) {
  if (
    item.alcance_nuevo !==
    'dirigida'
  ) {
    return 'No aplica'
  }

  if (
    item.destinatarios.length ===
    0
  ) {
    return 'Sin destinatarios registrados'
  }

  return item.destinatarios
    .map(
      (recipient) =>
        `${recipient.nombre_completo} (${recipient.email})`,
    )
    .join(' | ')
}

/*
 * ============================================================
 * ESCAPAR VALORES CSV
 * ============================================================
 */
function escapeCsv(
  value: string,
) {
  const escaped =
    value.replace(
      /"/g,
      '""',
    )

  return `"${escaped}"`
}

/*
 * ============================================================
 * GENERAR NOMBRE DEL ARCHIVO
 * ============================================================
 */
function createFileName(
  extension:
    | 'csv'
    | 'txt'
    | 'json',
) {
  const now =
    new Date()

  const date =
    now
      .toISOString()
      .slice(
        0,
        10,
      )

  return `fileversex-reporte-trazabilidad-${date}.${extension}`
}

/*
 * ============================================================
 * DESCARGAR ARCHIVO
 * ============================================================
 */
function downloadFile(
  content: string,
  fileName: string,
  mimeType: string,
) {
  const blob =
    new Blob(
      [
        content,
      ],
      {
        type:
          mimeType,
      },
    )

  const url =
    URL.createObjectURL(
      blob,
    )

  const link =
    document.createElement(
      'a',
    )

  link.href =
    url

  link.download =
    fileName

  document.body.appendChild(
    link,
  )

  link.click()

  document.body.removeChild(
    link,
  )

  URL.revokeObjectURL(
    url,
  )
}

export default ReportsPage