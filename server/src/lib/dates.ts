function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function addMonths(date: Date, months: number): Date {
  const target = new Date(date);
  const monthIndex = date.getUTCMonth() + months;
  const year = date.getUTCFullYear() + Math.floor(monthIndex / 12);
  const month = ((monthIndex % 12) + 12) % 12;
  target.setUTCFullYear(year, month, Math.min(date.getUTCDate(), daysInMonth(year, month)));
  return target;
}

export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12);
}

export function nextMonthlyDate(start: Date, now: Date): Date {
  if (start > now) return start;
  const elapsedMonths =
    (now.getUTCFullYear() - start.getUTCFullYear()) * 12 + now.getUTCMonth() - start.getUTCMonth();
  let months = Math.max(elapsedMonths, 1);
  while (addMonths(start, months) <= now) months += 1;
  return addMonths(start, months);
}
