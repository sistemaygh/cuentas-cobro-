import jsPDF from 'jspdf'
import { formatFechaCorta } from './formatters'

function fmtVal(n) {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('es-CO').format(Math.round(n))
}

function numeroALetras(valor) {
  const n = Math.round(Math.abs(valor || 0))
  if (n === 0) return 'CERO PESOS M/CTE'

  const U = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE',
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE']
  const D = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
  const C = ['', 'CIEN', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

  function c3(x) {
    if (x === 0) return ''
    if (x < 20) return U[x]
    if (x < 100) {
      const d = Math.floor(x / 10), u = x % 10
      if (d === 2 && u > 0) return 'VEINTI' + U[u]
      return u === 0 ? D[d] : D[d] + ' Y ' + U[u]
    }
    const c = Math.floor(x / 100), r = x % 100
    const cs = (c === 1 && r > 0) ? 'CIENTO' : C[c]
    return r === 0 ? cs : cs + ' ' + c3(r)
  }

  const mill = Math.floor(n / 1000000)
  const restoMill = n % 1000000
  const miles = Math.floor(restoMill / 1000)
  const resto = restoMill % 1000

  let res = ''
  if (mill > 0) res += (mill === 1 ? 'UN MILLÓN' : c3(mill) + ' MILLONES') + ' '
  if (miles > 0) res += (miles === 1 ? 'MIL' : c3(miles) + ' MIL') + ' '
  if (resto > 0) res += c3(resto)

  return res.trim() + ' PESOS M/CTE'
}

export function generarPDF(cuenta, config = {}) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const W = 210
  const m = 11
  const cW = W - m * 2  // 188mm

  const NAVY = [30, 58, 95]
  const LGRAY = [232, 235, 240]
  const WHITE = [255, 255, 255]
  const DARK = [15, 15, 15]
  const MGRAY = [180, 180, 180]

  // Columnas del grid CC/NIT
  const cc0 = m           // Nombre
  const cc1 = m + 82      // CC
  const cc2 = m + 92      // NIT
  const cc3 = m + 102     // No. Identificación
  const cc4 = m + 168     // DV
  const cc5 = m + cW      // Fin

  let y = m

  // ══ LOGO + TÍTULO ══════════════════════════════════════
  const logoH = 22
  if (config.logo) {
    try {
      doc.addImage(config.logo, 'PNG', m, y, 70, logoH)
    } catch { /* logo inválido */ }
  }

  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...NAVY)
  doc.text('CUENTA DE COBRO', W - m, y + 9, { align: 'right' })
  doc.setFontSize(11)
  doc.text(`No. ${cuenta.numero || '0000'}`, W - m, y + 16, { align: 'right' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(80, 80, 80)
  doc.text(`Fecha: ${formatFechaCorta(cuenta.fecha)}`, W - m, y + 22, { align: 'right' })

  y += logoH + 2

  // ══ FUNCIONES HELPER ═══════════════════════════════════
  function sectionHeader(title, yPos) {
    doc.setFillColor(...NAVY)
    doc.rect(m, yPos, cW, 6.5, 'F')
    doc.setTextColor(...WHITE)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.text(title, m + 2, yPos + 4.5)
    return yPos + 6.5
  }

  function gridHeader(yPos) {
    doc.setFillColor(...LGRAY)
    doc.setDrawColor(...MGRAY)
    doc.rect(m, yPos, cW, 5.5, 'FD')
    ;[cc1, cc2, cc3, cc4].forEach(x => doc.line(x, yPos, x, yPos + 5.5))

    doc.setTextColor(...DARK)
    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.text('Nombre', cc0 + 1.5, yPos + 3.8)
    doc.text('C.C.', cc1 + 2, yPos + 3.8)
    doc.text('NIT', cc2 + 2, yPos + 3.8)
    doc.text('No. DE IDENTIFICACION', cc3 + 2, yPos + 3.8)
    doc.text('DV', cc4 + 2, yPos + 3.8)
    return yPos + 5.5
  }

  function dataRow(nombre, tipoDoc, idNum, dv, yPos) {
    const rH = 8
    doc.setFillColor(...WHITE)
    doc.setDrawColor(...MGRAY)
    doc.rect(m, yPos, cW, rH, 'FD')
    ;[cc1, cc2, cc3, cc4].forEach(x => doc.line(x, yPos, x, yPos + rH))

    doc.setTextColor(...DARK)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    const nombreTxt = doc.splitTextToSize(nombre || '', cc1 - cc0 - 3)[0] || ''
    doc.text(nombreTxt, cc0 + 1.5, yPos + 5.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    if (tipoDoc === 'cc') doc.text('X', cc1 + 3.5, yPos + 5.5)
    else doc.text('X', cc2 + 3.5, yPos + 5.5)

    doc.text(idNum || '', cc3 + 2, yPos + 5.5)
    doc.text(dv || '', cc4 + 2, yPos + 5.5)
    return yPos + rH
  }

  function addressRow(dir, tel, ciudad, yPos) {
    const rH = 9
    const mid1 = m + 74
    const mid2 = m + 130
    doc.setFillColor(...WHITE)
    doc.setDrawColor(...MGRAY)
    doc.rect(m, yPos, cW, rH, 'FD')
    doc.line(mid1, yPos, mid1, yPos + rH)
    doc.line(mid2, yPos, mid2, yPos + rH)

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(110, 110, 110)
    doc.text('Dirección', m + 1.5, yPos + 3.5)
    doc.text('Teléfono', mid1 + 1.5, yPos + 3.5)
    doc.text('Ciudad', mid2 + 1.5, yPos + 3.5)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(...DARK)
    doc.text(doc.splitTextToSize(dir || '', mid1 - m - 3)[0] || '', m + 1.5, yPos + 7.8)
    doc.text(tel || '', mid1 + 1.5, yPos + 7.8)
    doc.text(ciudad || '', mid2 + 1.5, yPos + 7.8)
    return yPos + rH
  }

  // ══ SECCIÓN PERSONA NATURAL ════════════════════════════
  y = sectionHeader('INFORMACIÓN DE LA PERSONA NATURAL (Vendedor o Prestador de Servicio)', y)
  y = gridHeader(y)
  y = dataRow(config.nombre, config.tipoDoc || 'cc', config.nit, config.dv, y)
  y = addressRow(config.direccion, config.telefono, config.ciudad || 'Bogotá', y)

  y += 2

  // ══ SECCIÓN COMPRADOR ══════════════════════════════════
  y = sectionHeader('INFORMACIÓN DEL COMPRADOR', y)
  y = gridHeader(y)
  y = dataRow(cuenta.clienteNombre, cuenta.clienteTipoDoc || 'nit', cuenta.clienteNit, cuenta.clienteDv, y)
  y = addressRow(cuenta.clienteDireccion, cuenta.clienteTelefono, cuenta.clienteCiudad, y)

  y += 2

  // ══ CONCEPTO Y VALOR ═══════════════════════════════════
  const vColW = 48
  const cColW = cW - vColW

  doc.setFillColor(...NAVY)
  doc.rect(m, y, cColW, 6.5, 'F')
  doc.rect(m + cColW, y, vColW, 6.5, 'F')
  doc.setTextColor(...WHITE)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('CONCEPTO', m + 2, y + 4.5)
  doc.text('VALOR', m + cColW + vColW / 2, y + 4.5, { align: 'center' })
  y += 6.5

  function conceptRow(texto, valor, bg, yPos, negativo) {
    const lines = doc.splitTextToSize(texto || '', cColW - 4)
    const rH = Math.max(8, lines.length * 5 + 3)
    doc.setFillColor(...(bg || WHITE))
    doc.setDrawColor(...MGRAY)
    doc.rect(m, yPos, cColW, rH, 'FD')
    doc.rect(m + cColW, yPos, vColW, rH, 'FD')

    doc.setTextColor(negativo ? 160 : 20, 20, 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(lines, m + 2, yPos + 5.5)

    doc.setFont('helvetica', negativo ? 'bold' : 'normal')
    doc.setTextColor(negativo ? 150 : 20, negativo ? 30 : 20, negativo ? 30 : 20)
    doc.text(valor, W - m - 2, yPos + rH / 2 + 2, { align: 'right' })
    doc.setTextColor(...DARK)
    return yPos + rH
  }

  // Fila honorarios
  y = conceptRow(cuenta.concepto, fmtVal(cuenta.valor), WHITE, y, false)

  // Fila retención
  if (cuenta.retencion > 0) {
    y = conceptRow(
      `Honorarios ${cuenta.retencionPorcentaje || 11}%`,
      `-${fmtVal(cuenta.retencion)}`,
      [255, 248, 248],
      y,
      true
    )
  }

  // Fila IVA
  if (cuenta.iva > 0) {
    y = conceptRow(`IVA ${cuenta.ivaPorcentaje || 19}%`, fmtVal(cuenta.iva), WHITE, y, false)
  }

  // Fila banco / neto
  const bancoTexto = (() => {
    const partes = []
    if (config.banco || config.cuentaBancaria) {
      partes.push(`Favor consignar a la cuenta de ${config.tipoCuenta || 'ahorros'} ${config.banco || ''} ${config.cuentaBancaria || ''}`.trim())
    }
    return partes.join('\n')
  })()

  y = conceptRow(bancoTexto || '  ', fmtVal(cuenta.total), [245, 248, 252], y, false)

  y += 3

  // ══ DECLARACIÓN TRIBUTARIA ════════════════════════════
  const decl = config.declaracion ||
    'Para efectos tributarios declaro:\nSoy persona residente nacional, régimen simplificado.\nDeclaro impuesto de renta y complementarios por patrimonio.\nNo tengo empleados a mi cargo.'

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(55, 55, 55)
  decl.split('\n').forEach((line, i) => doc.text(line, m, y + i * 4.5))
  y += decl.split('\n').length * 4.5 + 6

  // ══ FIRMA + TOTALES ════════════════════════════════════
  const firmaY = y

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('FIRMA VENDEDOR O PRESTADOR DEL SERVICIO', m, firmaY)
  doc.setDrawColor(120, 120, 120)
  doc.line(m, firmaY + 15, m + 90, firmaY + 15)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(config.nombre || '', m, firmaY + 19)
  if (config.nit) doc.text(`C.C./NIT: ${config.nit}`, m, firmaY + 24)

  // Cuadro totales (derecha)
  const totX = W - m - 72
  const totW = 72
  const totH = 9

  doc.setFillColor(...LGRAY)
  doc.setDrawColor(...MGRAY)
  doc.rect(totX, firmaY - 2, totW, totH, 'FD')
  doc.line(totX + 38, firmaY - 2, totX + 38, firmaY + totH - 2)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('TOTAL', totX + 2, firmaY + 4)
  doc.text(fmtVal(cuenta.total), totX + totW - 2, firmaY + 4, { align: 'right' })

  doc.setFillColor(...WHITE)
  doc.rect(totX, firmaY + totH - 2, totW, totH, 'FD')
  doc.line(totX + 38, firmaY + totH - 2, totX + 38, firmaY + totH * 2 - 2)
  doc.text('NETO A PAGAR', totX + 2, firmaY + totH + 5)
  doc.text(fmtVal(cuenta.total), totX + totW - 2, firmaY + totH + 5, { align: 'right' })

  // Son: en letras
  const sonY = firmaY + 26
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(40, 40, 40)
  const sonText = `Son: ${numeroALetras(cuenta.total)}`
  doc.text(doc.splitTextToSize(sonText, cW), m, sonY)

  const fileName = `Cuenta-${cuenta.numero || '0000'}-${(cuenta.clienteNombre || 'cliente').replace(/\s+/g, '_')}.pdf`
  doc.save(fileName)
  return doc.output('blob')
}
