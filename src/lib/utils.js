/**
 * AffiliateAI Pro - Utility Functions
 */

export const formatDate = (date, format = 'short') => {
  const d = new Date(date)
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    full: { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  }
  return d.toLocaleDateString('en-US', options[format] || options.short)
}

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}

export const readingTime = (text) => {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

export const wordCount = (text) => {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

export const truncate = (text, length = 100) => {
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

export const generateId = () => {
  return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
}

export const generateShortCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

export const downloadAsFile = (content, filename, type = 'text/plain') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const markdownToHTML = (text) => {
  return text
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>')
}

export const percentage = (value, total) => {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export const calculateROI = (revenue, cost) => {
  if (cost === 0) return revenue > 0 ? 100 : 0
  return ((revenue - cost) / cost * 100).toFixed(2)
}

export const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export const formatLargeNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

