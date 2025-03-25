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
