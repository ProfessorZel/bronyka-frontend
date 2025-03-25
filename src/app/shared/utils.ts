export function userConfirmAction(title: string) {
  const confirmChange = confirm(title);
  return confirmChange;
}
