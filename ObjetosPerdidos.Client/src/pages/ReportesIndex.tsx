import { useState } from 'react'
import { Link } from 'react-router-dom'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { reportesService } from '../servicios'
import { normalizarFecha } from '../utils'
import type { ObjetoPerdido } from '../types'

const reportes = [
  {
    to: '/reportes/general',
    icon: '📈',
    title: 'Reporte General',
    description: 'Estadísticas globales: totales, entregados, pendientes y tasa de entrega.',
    color: 'hover:border-uam-300',
    tag: 'Resumen',
  },
  {
    to: '/reportes/rango',
    icon: '📅',
    title: 'Por Rango de Fechas',
    description: 'Filtra objetos registrados dentro de un rango de fechas específico.',
    color: 'hover:border-purple-300',
    tag: 'Filtro',
  },
  {
    to: '/reportes/estados',
    icon: '🥧',
    title: 'Estados',
    description: 'Proporción de objetos entregados vs. pendientes con gráfico circular.',
    color: 'hover:border-emerald-300',
    tag: 'Gráfica',
  },
  {
    to: '/reportes/lugar',
    icon: '📍',
    title: 'Por Lugar',
    description: 'Distribución de objetos según el lugar de hallazgo en el campus.',
    color: 'hover:border-amber-300',
    tag: 'Gráfica',
  },
  {
    to: '/reportes/tendencia',
    icon: '📉',
    title: 'Tendencia Diaria',
    description: 'Evolución día a día de registros y entregas a lo largo del tiempo.',
    color: 'hover:border-blue-300',
    tag: 'Tendencia',
  },
]

// ── helpers PDF ──────────────────────────────────────────────────────────────

const AZUL: [number, number, number] = [37, 99, 235]

function seccionTitulo(doc: jsPDF, texto: string, y: number) {
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(0, 0, 0)
  doc.text(texto, 14, y)
}

function finalY(doc: jsPDF): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable?.finalY ?? 60
}

function addPieDesPaginas(doc: jsPDF) {
  const total = doc.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(160, 160, 160)
    doc.text(
      `Sistema de Objetos Perdidos UAM  ·  Página ${p} de ${total}`,
      105,
      290,
      { align: 'center' },
    )
  }
}

// ────────────────────────────────────────────────────────────────────────────

export default function ReportesIndex() {
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [pdfLoading, setPdfLoading] = useState(false)

  const tieneFiltro = fechaDesde.trim() !== '' && fechaHasta.trim() !== ''

  async function handleGenerarPDF() {
    setPdfLoading(true)
    try {
      const desdeNorm = normalizarFecha(fechaDesde.trim())
      const hastaNorm = normalizarFecha(fechaHasta.trim())

      // Llamadas base (siempre)
      const [general, estados, lugar, tendencia] = await Promise.all([
        reportesService.getGeneral(),
        reportesService.getEstados(),
        reportesService.getLugar(),
        reportesService.getTendencia(),
      ])

      // Llamada de rango solo si hay fechas
      let rangoData: { objetos: ObjetoPerdido[]; total: number; entregados: number; pendientes: number; tasaEntrega: number } | null = null
      if (tieneFiltro) {
        rangoData = await reportesService.getRango(desdeNorm, hastaNorm)
      }

      // ── Documento ──────────────────────────────────────────────
      const doc = new jsPDF()
      const fechaHoy = new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })

      // Encabezado azul
      doc.setFillColor(...AZUL)
      doc.rect(0, 0, 210, 42, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(15)
      doc.setFont('helvetica', 'bold')
      doc.text('Sistema de Gestión de Objetos Perdidos', 105, 13, { align: 'center' })

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('Universidad Autónoma de Madrid', 105, 21, { align: 'center' })

      doc.setFontSize(13)
      doc.setFont('helvetica', 'bold')
      doc.text('Reporte Completo', 105, 32, { align: 'center' })

      doc.setTextColor(0, 0, 0)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')

      if (tieneFiltro) {
        doc.text(`Generado el: ${fechaHoy}   ·   Período: ${desdeNorm} – ${hastaNorm}`, 14, 50)
      } else {
        doc.text(`Generado el: ${fechaHoy}   ·   Todos los registros`, 14, 50)
      }

      // ── 1. Estadísticas Generales ──────────────────────────────
      seccionTitulo(doc, '1. Estadísticas Generales', 58)
      autoTable(doc, {
        startY: 62,
        head: [['Métrica', 'Valor']],
        body: [
          ['Total de objetos registrados', String(general.total)],
          ['Objetos entregados', String(general.entregados)],
          ['Objetos pendientes', String(general.pendientes)],
          ['Tasa de entrega', `${general.tasaEntrega}%`],
          ['Lugar más frecuente', `${general.lugarFrecuente} (${general.lugarFrecuenteConteo} objetos)`],
        ],
        theme: 'striped',
        headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 110 } },
      })

      // ── 2. Registros en el período (solo si hay filtro) ────────
      let secIdx = 2
      if (rangoData) {
        let y = finalY(doc) + 12
        if (y > 220) { doc.addPage(); y = 20 }
        seccionTitulo(doc, `${secIdx}. Objetos Registrados en el Período (${desdeNorm} – ${hastaNorm})`, y)
        secIdx++

        // Resumen del período
        autoTable(doc, {
          startY: y + 4,
          head: [['Métrica del período', 'Valor']],
          body: [
            ['Total en el período', String(rangoData.total)],
            ['Entregados', String(rangoData.entregados)],
            ['Pendientes', String(rangoData.pendientes)],
            ['Tasa de entrega del período', `${rangoData.tasaEntrega}%`],
          ],
          theme: 'striped',
          headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: 110 } },
          margin: { bottom: 20 },
        })

        // Tabla de objetos del período
        if (rangoData.objetos.length > 0) {
          y = finalY(doc) + 6
          if (y > 220) { doc.addPage(); y = 20 }
          doc.setFontSize(9)
          doc.setFont('helvetica', 'italic')
          doc.setTextColor(100, 100, 100)
          doc.text('Listado de objetos en el período:', 14, y)

          autoTable(doc, {
            startY: y + 4,
            head: [['#', 'Nombre', 'Lugar', 'F. Registro', 'Estado']],
            body: rangoData.objetos.map((o) => [
              String(o.id),
              o.nombre,
              o.lugar,
              o.fechaRegistro.split('T')[0],
              o.estado,
            ]),
            theme: 'striped',
            headStyles: { fillColor: [124, 58, 237], textColor: 255, fontStyle: 'bold' },
            columnStyles: { 0: { cellWidth: 12 }, 3: { cellWidth: 28 }, 4: { cellWidth: 24 } },
            styles: { fontSize: 8 },
            margin: { bottom: 20 },
          })
        }
      }

      // ── 3. Distribución por Estado ─────────────────────────────
      {
        let y = finalY(doc) + 12
        if (y > 220) { doc.addPage(); y = 20 }
        seccionTitulo(doc, `${secIdx}. Distribución por Estado`, y)
        secIdx++
        autoTable(doc, {
          startY: y + 4,
          head: [['Estado', 'Cantidad', 'Porcentaje']],
          body: [
            ['Entregados', String(estados.entregados), `${estados.porcentajeEntregados}%`],
            ['Pendientes', String(estados.pendientes), `${estados.porcentajePendientes}%`],
            ['Total', String(estados.total), '100%'],
          ],
          theme: 'striped',
          headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold' },
          margin: { bottom: 20 },
        })
      }

      // ── 4. Objetos por Lugar ───────────────────────────────────
      {
        let y = finalY(doc) + 12
        if (y > 220) { doc.addPage(); y = 20 }
        seccionTitulo(doc, `${secIdx}. Objetos por Lugar de Hallazgo`, y)
        secIdx++
        autoTable(doc, {
          startY: y + 4,
          head: [['Lugar', 'Cantidad de Objetos']],
          body: lugar.lugares.map((l: { lugar: string; cantidad: number }) => [
            l.lugar,
            String(l.cantidad),
          ]),
          theme: 'striped',
          headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold' },
          margin: { bottom: 20 },
        })
      }

      // ── 5. Tendencia Diaria (siempre en nueva página) ──────────
      doc.addPage()
      seccionTitulo(doc, `${secIdx}. Tendencia Diaria de Registros y Entregas`, 20)
      autoTable(doc, {
        startY: 25,
        head: [['Fecha', 'Registros', 'Entregas']],
        body: tendencia.datos.map((d: { fecha: string; registros: number; entregas: number }) => [
          d.fecha,
          String(d.registros),
          String(d.entregas),
        ]),
        theme: 'striped',
        headStyles: { fillColor: AZUL, textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        margin: { bottom: 20 },
      })

      // ── Pie de página ─────────────────────────────────────────
      addPieDesPaginas(doc)

      const nombreArchivo = tieneFiltro
        ? `reporte-${desdeNorm.replace(/\//g, '-')}_${hastaNorm.replace(/\//g, '-')}.pdf`
        : `reporte-completo-${fechaHoy.replace(/\//g, '-')}.pdf`

      doc.save(nombreArchivo)
    } catch {
      alert('Error al generar el PDF. Por favor intenta de nuevo.')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="page-title">Reportes</h1>
        <p className="page-subtitle">Análisis y estadísticas del sistema de objetos perdidos</p>
      </div>

      {/* Panel de exportación PDF */}
      <div className="card border-2 border-red-100 bg-red-50/40">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📄</span>
          <div>
            <p className="font-bold text-gray-800 text-sm">Exportar Reporte Completo a PDF</p>
            <p className="text-xs text-gray-500">
              Genera un documento con estadísticas, estados, objetos por lugar y tendencia diaria.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label">Fecha desde <span className="font-normal text-gray-400">(opcional)</span></label>
            <input
              type="text"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              placeholder="dd/MM/yyyy"
              className="input w-36"
            />
          </div>
          <div>
            <label className="label">Fecha hasta <span className="font-normal text-gray-400">(opcional)</span></label>
            <input
              type="text"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              placeholder="dd/MM/yyyy"
              className="input w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs text-gray-400">Dejar vacío = todos los registros</p>
            <button
              onClick={handleGenerarPDF}
              disabled={pdfLoading || (fechaDesde.trim() !== '' && fechaHasta.trim() === '') || (fechaDesde.trim() === '' && fechaHasta.trim() !== '')}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow transition-colors"
            >
              {pdfLoading ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                  Generando PDF…
                </>
              ) : (
                <>📥 Descargar PDF</>
              )}
            </button>
          </div>
        </div>

        {tieneFiltro && (
          <p className="mt-3 text-xs text-purple-700 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
            ✓ El PDF incluirá una sección extra con los objetos registrados entre{' '}
            <strong>{normalizarFecha(fechaDesde)}</strong> y <strong>{normalizarFecha(fechaHasta)}</strong>.
          </p>
        )}
      </div>

      {/* Tarjetas de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reportes.map((r) => (
          <Link
            key={r.to}
            to={r.to}
            className={`card group transition-all hover:shadow-md border-2 border-gray-100 ${r.color}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {r.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {r.tag}
              </span>
            </div>
            <h2 className="font-bold text-gray-900 group-hover:text-uam-700 transition-colors">
              {r.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{r.description}</p>
            <div className="mt-4 flex items-center text-xs font-semibold text-uam-700 opacity-0 group-hover:opacity-100 transition-opacity">
              Ver reporte →
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
