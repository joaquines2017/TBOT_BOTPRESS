import React from 'react'
import { CButton } from '@coreui/react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import mpfLogo from '../../assets/images/mpf-logo.png' // PNG/JPG válido

const ReportePersonalizado = ({ datosFiltrados, filtrosAplicados }) => {
  const descripcionFiltros = Object.entries(filtrosAplicados || {})
    .filter(([key, value]) => value && value !== '' && value !== 'Todos')
    .map(([key, value]) => `${key}: ${value}`)
    .join(' | ') || 'Sin filtros'

  const columns = [
    { header: 'ID', dataKey: 'id' },
    { header: 'Asunto', dataKey: 'asunto' },
    { header: 'Estado', dataKey: 'estado' },
    { header: 'Prioridad', dataKey: 'prioridad' },
    { header: 'Asignado a', dataKey: 'asignado' },
    { header: 'Oficina', dataKey: 'oficina' },
    { header: 'Empleado', dataKey: 'empleado' },
    { header: 'Nro de Contacto', dataKey: 'contacto' },
    { header: 'Creado', dataKey: 'creado' },
  ]

  const exportarPDF = () => {
    try {
      const doc = new jsPDF('landscape')
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 15

      // Si quieres probar con el logo, descomenta:
      // try {
      //   doc.addImage(mpfLogo, 'PNG', pageWidth - 50, 8, 35, 20)
      // } catch (imgErr) {
      //   console.warn('No se pudo cargar el logo en el PDF:', imgErr)
      // }

      doc.setFontSize(18)
      doc.text('Reporte Personalizado de Tickets', margin, 25)
      doc.setFontSize(10)
      doc.text(`Filtros aplicados: ${descripcionFiltros}`, margin, 35)

      const rows = (datosFiltrados || []).map(ticket => ({
        id: ticket.id || ticket.ID || '',
        asunto: ticket.asunto || ticket.subject || '',
        estado: ticket.estado || ticket.status || '',
        prioridad: ticket.prioridad || ticket.priority || '',
        asignado: ticket.asignadoA || ticket['asignado a'] || ticket.assigned_to || '',
        oficina: ticket.oficina || ticket.office || '',
        empleado: ticket.empleado || ticket.employee || '',
        contacto: ticket.contacto || ticket['nro de contacto'] || ticket.contact || '',
        creado: ticket.creado || ticket.created_on || '',
      }))

      autoTable(doc, {
        startY: 45,
        head: [columns.map(col => col.header)],
        body: rows.map(row => columns.map(col => row[col.dataKey])),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [44, 90, 160] },
        margin: { left: margin, right: margin },
      })

      doc.save('reporte_tickets.pdf')
      console.log('PDF generado correctamente')
    } catch (err) {
      console.error('Error al exportar PDF:', err)
      alert('Error al generar el PDF. Ver consola para más detalles.')
    }
  }

  return (
    <div>
      <CButton color="danger" onClick={exportarPDF}>
        <img src={mpfLogo} alt="logo" style={{ width: 20, marginRight: 8, verticalAlign: 'middle' }} />
        PDF
      </CButton>
    </div>
  )
}

export default ReportePersonalizado