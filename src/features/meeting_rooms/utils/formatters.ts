export function weekdayFormatter(date: Date) {
  const weekday = new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
  }).format(date);
  return weekday.charAt(0).toUpperCase().concat(weekday.slice(1));
}

export function dayFormatter(date: Date) {
  const day = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
  return day;
}

export function selectRangeFormatter(range: { start: Date; end: Date }) {
  const { start, end } = range;
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    minute: 'numeric',
    hour: 'numeric',
  }).format;
  const startDay = formatter(start);
  const endDay = formatter(end);
  return `${startDay} - ${endDay}`;
}

export function isoFormatter(data: Date) {
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    minute: 'numeric',
    hour: 'numeric',
  }).format;
  return formatter(data);
}

export function timeGutterFormatter(date: Date) {
  const time = new Intl.DateTimeFormat('ru-RU', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);

  return time;
}

export function rangeFormatterOnlyTime(range: { start: Date; end: Date }) {
  const { start, end } = range;
  const formatter = new Intl.DateTimeFormat('ru-RU', {
    minute: 'numeric',
    hour: 'numeric',
  }).format;
  const startDay = formatter(start);
  const endDay = formatter(end);
  return `${startDay} - ${endDay}`;
}
