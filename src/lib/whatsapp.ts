export function generateWhatsAppLink(
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function formatWhatsAppMessage(
  template: string,
  variables: Record<string, string>
): string {
  let message = template
  Object.keys(variables).forEach((key) => {
    message = message.replace(new RegExp(`{{${key}}}`, 'g'), variables[key])
  })
  return message
}
