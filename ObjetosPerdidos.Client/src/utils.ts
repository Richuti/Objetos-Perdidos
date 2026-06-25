/** Normaliza dd/M/yyyy o d/MM/yyyy → dd/MM/yyyy antes de enviar a la API */
export function normalizarFecha(fecha: string): string {
  const parts = fecha.trim().split('/')
  if (parts.length !== 3) return fecha
  const [d, m, y] = parts
  return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
}
