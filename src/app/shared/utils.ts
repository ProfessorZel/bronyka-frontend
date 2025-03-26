export function userConfirmAction(title: string) {
  const confirmChange = confirm(title);
  return confirmChange;
}

export function dateTimeFormatter(dtString: string) {
  const dt = new Date(dtString);
  return new Intl.DateTimeFormat("ru", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(dt);
}

export function toNaiveISOString(date: Date) {
  const currentDate = new Date(date.getTime() + 3 * 3600000);
  return currentDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
}
