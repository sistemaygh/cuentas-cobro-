import { formatCOP } from './formatters'

export function abrirWhatsApp(cuenta, telefono) {
  const numero = telefono ? telefono.replace(/\D/g, '') : ''
  const tel = numero.startsWith('57') ? numero : `57${numero}`

  const mensaje = encodeURIComponent(
    `Hola! Le comparto la cuenta de cobro No. *${cuenta.numero}* por concepto de *${cuenta.concepto}*.\n\n` +
    `*Total a pagar: ${formatCOP(cuenta.total)}*\n\n` +
    `Adjunto el PDF con el detalle. Quedo pendiente de su confirmación. ¡Gracias!`
  )

  const url = `https://wa.me/${tel}?text=${mensaje}`
  window.open(url, '_blank')
}
