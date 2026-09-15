import {
  BarChart3,
  Download,
  FileJson,
  FileSpreadsheet,
  FileText,
  Globe2,
  Heart,
  MessageCircle,
  Trophy,
  UserRound,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  getMyStatisticsRequest,
  type UserStatistics,
} from '../../features/statistics/services/statistics.service'

function StatisticsPage() {
  const [
    statistics,
    setStatistics,
  ] =
    useState<UserStatistics | null>(
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

  useEffect(() => {
    loadStatistics()
  }, [])

  async function loadStatistics() {
    setIsLoading(true)
    setError('')

    try {
      const data =
        await getMyStatisticsRequest()

      setStatistics(data)
    } catch (requestError) {
      if (
        requestError instanceof Error
      ) {
        setError(
          requestError.message,
        )
      } else {
        setError(
          'No fue posible obtener las estadísticas',
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  function downloadFile(
    content: string,
    fileName: string,
    mimeType: string,
  ) {
    const blob =
      new Blob(
        [content],
        {
          type: mimeType,
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

    link.href = url
    link.download = fileName

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

  function getExportRows() {
    if (!statistics) {
      return []
    }

    const {
      resumen,
      archivo_mas_descargado,
      publicacion_mas_likes,
      publicacion_mas_comentarios,
      usuario_mas_archivos,
    } = statistics

    return [
      {
        indicador:
          'Total de archivos',
        valor:
          resumen.total_archivos,
      },
      {
        indicador:
          'Total de descargas',
        valor:
          resumen.total_descargas,
      },
      {
        indicador:
          'Total de publicaciones',
        valor:
          resumen.total_publicaciones,
      },
      {
        indicador:
          'Publicaciones públicas',
        valor:
          resumen.publicaciones_publicas,
      },
      {
        indicador:
          'Total de likes',
        valor:
          resumen.total_likes,
      },
      {
        indicador:
          'Total de comentarios',
        valor:
          resumen.total_comentarios,
      },
      {
        indicador:
          'Archivo más descargado',
        valor:
          archivo_mas_descargado
            ?.nombre ??
          'Sin información',
      },
      {
        indicador:
          'Descargas del archivo más descargado',
        valor:
          archivo_mas_descargado
            ?.descargas ??
          0,
      },
      {
        indicador:
          'Publicación con más likes',
        valor:
          publicacion_mas_likes
            ?.nombre_contenido ??
          'Sin información',
      },
      {
        indicador:
          'Likes de la publicación destacada',
        valor:
          publicacion_mas_likes
            ?.total_likes ??
          0,
      },
      {
        indicador:
          'Publicación con más comentarios',
        valor:
          publicacion_mas_comentarios
            ?.nombre_contenido ??
          'Sin información',
      },
      {
        indicador:
          'Comentarios de la publicación destacada',
        valor:
          publicacion_mas_comentarios
            ?.total_comentarios ??
          0,
      },
      {
        indicador:
          'Usuario con más archivos',
        valor:
          usuario_mas_archivos
            ?.nombre ??
          'Sin información',
      },
      {
        indicador:
          'Cantidad de archivos del usuario destacado',
        valor:
          usuario_mas_archivos
            ?.total_archivos ??
          0,
      },
    ]
  }

  function escapeCsvValue(
    value: string | number,
  ) {
    const text =
      String(value)

    return `"${text.replace(
      /"/g,
      '""',
    )}"`
  }

  function exportCsv() {
    const rows =
      getExportRows()

    const csv = [
      'Indicador,Valor',
      ...rows.map(
        (row) =>
          `${escapeCsvValue(
            row.indicador,
          )},${escapeCsvValue(
            row.valor,
          )}`,
      ),
    ].join('\n')

    downloadFile(
      '\uFEFF' + csv,
      'fileversex-estadisticas.csv',
      'text/csv;charset=utf-8;',
    )
  }

  function exportTxt() {
    const rows =
      getExportRows()

    const text = [
      'FILEVERSEX - ESTADÍSTICAS',
      '========================',
      '',
      ...rows.map(
        (row) =>
          `${row.indicador}: ${row.valor}`,
      ),
    ].join('\n')

    downloadFile(
      text,
      'fileversex-estadisticas.txt',
      'text/plain;charset=utf-8;',
    )
  }

  function exportJson() {
    if (!statistics) {
      return
    }

    const json =
      JSON.stringify(
        {
          exportado_en:
            new Date().toISOString(),

          datos:
            statistics,
        },
        null,
        2,
      )

    downloadFile(
      json,
      'fileversex-estadisticas.json',
      'application/json;charset=utf-8;',
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white">

        <div className="flex flex-col items-center gap-3">

          <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="text-sm text-slate-500">
            Cargando estadísticas...
          </p>
        </div>
      </div>
    )
  }

  if (
    error ||
    !statistics
  ) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error ||
          'No fue posible cargar las estadísticas'}
      </div>
    )
  }

  const {
    resumen,
    archivo_mas_descargado,
    publicacion_mas_likes,
    publicacion_mas_comentarios,
    usuario_mas_archivos,
  } = statistics

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            Análisis personal
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Estadísticas
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Consulta el rendimiento de tus
            archivos y publicaciones en
            FileVerseX.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">

          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <FileSpreadsheet
              size={17}
            />
            CSV
          </button>

          <button
            type="button"
            onClick={exportTxt}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            <FileText
              size={17}
            />
            TXT
          </button>

          <button
            type="button"
            onClick={exportJson}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
          >
            <FileJson
              size={17}
            />
            JSON
          </button>
        </div>
      </div>

      {/* TARJETAS */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

        <StatCard
          title="Archivos"
          value={
            resumen.total_archivos
          }
          icon={FileText}
        />

        <StatCard
          title="Descargas"
          value={
            resumen.total_descargas
          }
          icon={Download}
        />

        <StatCard
          title="Publicaciones"
          value={
            resumen.total_publicaciones
          }
          icon={BarChart3}
        />

        <StatCard
          title="Públicas"
          value={
            resumen.publicaciones_publicas
          }
          icon={Globe2}
        />

        <StatCard
          title="Likes"
          value={
            resumen.total_likes
          }
          icon={Heart}
        />

        <StatCard
          title="Comentarios"
          value={
            resumen.total_comentarios
          }
          icon={MessageCircle}
        />
      </div>

      {/* DESTACADOS */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">

        <HighlightCard
          title="Archivo más descargado"
          icon={Download}
          name={
            archivo_mas_descargado
              ?.nombre ??
            'Sin información'
          }
          value={
            archivo_mas_descargado
              ? `${archivo_mas_descargado.descargas} descargas`
              : '0 descargas'
          }
        />

        <HighlightCard
          title="Publicación con más likes"
          icon={Heart}
          name={
            publicacion_mas_likes
              ?.nombre_contenido ??
            'Sin información'
          }
          value={
            publicacion_mas_likes
              ? `${publicacion_mas_likes.total_likes} likes`
              : '0 likes'
          }
        />

        <HighlightCard
          title="Publicación con más comentarios"
          icon={MessageCircle}
          name={
            publicacion_mas_comentarios
              ?.nombre_contenido ??
            'Sin información'
          }
          value={
            publicacion_mas_comentarios
              ? `${publicacion_mas_comentarios.total_comentarios} comentarios`
              : '0 comentarios'
          }
        />

        <HighlightCard
          title="Usuario con más archivos"
          icon={UserRound}
          name={
            usuario_mas_archivos
              ?.nombre ??
            'Sin información'
          }
          value={
            usuario_mas_archivos
              ? `${usuario_mas_archivos.total_archivos} archivos`
              : '0 archivos'
          }
        />
      </div>

      {/* RESUMEN */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Trophy
              size={21}
            />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">
              Resumen de actividad
            </h2>

            <p className="text-sm text-slate-500">
              Datos acumulados de tu cuenta.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <SummaryItem
            label="Archivos registrados"
            value={
              resumen.total_archivos
            }
          />

          <SummaryItem
            label="Descargas acumuladas"
            value={
              resumen.total_descargas
            }
          />

          <SummaryItem
            label="Publicaciones activas"
            value={
              resumen.total_publicaciones
            }
          />

          <SummaryItem
            label="Publicaciones públicas"
            value={
              resumen.publicaciones_publicas
            }
          />

          <SummaryItem
            label="Likes recibidos"
            value={
              resumen.total_likes
            }
          />

          <SummaryItem
            label="Comentarios recibidos"
            value={
              resumen.total_comentarios
            }
          />
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number

  icon: React.ComponentType<{
    size?: number
  }>
}

function StatCard({
  title,
  value,
  icon: Icon,
}: StatCardProps) {
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

interface HighlightCardProps {
  title: string
  name: string
  value: string

  icon: React.ComponentType<{
    size?: number
  }>
}

function HighlightCard({
  title,
  name,
  value,
  icon: Icon,
}: HighlightCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon
          size={20}
        />
      </div>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 break-words text-base font-semibold text-slate-900">
        {name}
      </h3>

      <p className="mt-2 text-sm font-medium text-blue-600">
        {value}
      </p>
    </div>
  )
}

interface SummaryItemProps {
  label: string
  value: number
}

function SummaryItem({
  label,
  value,
}: SummaryItemProps) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-4">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  )
}

export default StatisticsPage