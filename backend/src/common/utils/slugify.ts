export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normaliza diacríticos (ej. á -> a´)
    .replace(/[\u0300-\u036f]/g, '') // Elimina los diacríticos combinados
    .replace(/\s+/g, '-') // Reemplaza espacios con -
    .replace(/[^\w-]+/g, '') // Elimina todos los caracteres no alfanuméricos excepto -
    .replace(/--+/g, '-'); // Reemplaza múltiples - con uno solo
}