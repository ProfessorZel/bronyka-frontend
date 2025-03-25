export function isFormValid(
  formData: Record<string, number | string | Date | boolean>
) {
  return Object.entries(formData).reduce((a, [_, val]) => {
    if (typeof val === "string") return a && !!val;
    return a;
  }, true);
}
