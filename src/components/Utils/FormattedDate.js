const DateTimeFormat = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  hour: 'numeric',
  minute: 'numeric'
})

const DateFormat = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
})

const FormattedDate = ({date}) => {
  if (typeof date !== 'string') {
    return DateFormat.format(date)
  }
  return DateFormat.format(new Date(date))
}

const FormattedDateTime = ({date}) => {
  if (typeof date !== 'string') {
    return DateTimeFormat.format(date)
  }
  return DateTimeFormat.format(new Date(date))
}


export {FormattedDateTime, FormattedDate}