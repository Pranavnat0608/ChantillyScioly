// Minimal iCalendar export so tournaments/deadlines can be imported into
// Google Calendar, Apple Calendar, or Outlook.

const esc = (s = '') => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
const ymd = (iso) => iso.replaceAll('-', '')

function nextDay(iso) {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function buildIcs(items, calName) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Chantilly Science Olympiad//Team Portal//EN', `X-WR-CALNAME:${esc(calName)}`]
  for (const it of items) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${it.id}@scioly-portal`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(it.date)}`,
      `DTEND;VALUE=DATE:${ymd(nextDay(it.endDate || it.date))}`,
      `SUMMARY:${esc(it.title)}`,
    )
    if (it.location) lines.push(`LOCATION:${esc(it.location)}`)
    if (it.notes) lines.push(`DESCRIPTION:${esc(it.notes)}`)
    lines.push('END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadIcs(items, calName) {
  const blob = new Blob([buildIcs(items, calName)], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${calName.replace(/\W+/g, '-').toLowerCase()}.ics`
  a.click()
  URL.revokeObjectURL(a.href)
}

export function googleCalendarUrl(it) {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: it.title,
    dates: `${ymd(it.date)}/${ymd(nextDay(it.endDate || it.date))}`,
    details: it.notes ?? '',
    location: it.location ?? '',
  })
  return `https://calendar.google.com/calendar/render?${params}`
}
