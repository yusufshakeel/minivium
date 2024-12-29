export function genId() {
  const now = Date.now();
  const randomSuffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `${now.toString(16)}-${randomSuffix}`;
}