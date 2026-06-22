export function progressPercent(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.ceil((done / total) * 100);
}
