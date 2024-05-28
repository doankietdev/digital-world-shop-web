const formatCash = (number) => {
  if (number === null || number === undefined) return ''
  return new Intl.NumberFormat('vi-Vn', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    currencyDisplay: 'code'
  }).format(number)
}

const parseResponseMessage = (responseMessage) => {
  try {
    return JSON.parse(responseMessage)
  } catch (error) {
    return responseMessage
  }
}

const parsePlaceHolderUrl = (originalUrl, data = {}) => {
  const placeholderRegex = /:(\w+)/g
  const placeholderNames = Object.keys(data)

  return originalUrl.replace(placeholderRegex, (match, placeholderName) => {
    if (placeholderNames.includes(placeholderName)) {
      return data[placeholderName]
    } else {
      return match
    }
  })
}

export { formatCash, parseResponseMessage, parsePlaceHolderUrl }
