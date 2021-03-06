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
  return DateFormat.format(date)
}

const FormattedDateTime = ({date}) => {
  return DateTimeFormat.format(date)
}


export {FormattedDateTime, FormattedDate}