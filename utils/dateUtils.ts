import { eachDayOfInterval, endOfMonth, format, getDay, startOfMonth } from 'date-fns';

// Devuelve un array de objetos Date para todos los días del mes (por si se necesita en otro lado)
export function getDaysInMonth(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  return eachDayOfInterval({ start, end });
}

// Devuelve la fecha de hoy en formato "YYYY-MM-DD"
export function getTodayKey(): string {
  return formatDateKey(new Date());
}

// Convierte cualquier objeto Date a clave en formato "YYYY-MM-DD"
export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Devuelve todas las fechas del mes en formato "YYYY-MM-DD",
// incluyendo huecos al principio para cuadrar desde lunes
export function getMonthDays(year: number, month: number): string[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(start);
  const allDays = eachDayOfInterval({ start, end });

  const days: string[] = [];

  // Calcular cuántos huecos hay al principio (lunes = 0)
  const startOffset = (getDay(start) + 6) % 7;

  for (let i = 0; i < startOffset; i++) {
    days.push('');
  }

  for (const date of allDays) {
    days.push(formatDateKey(date));
  }

  return days;
}
