export function hasOwnerReportCount(reportCount: number | null | undefined): reportCount is number {
  return typeof reportCount === 'number' && Number.isFinite(reportCount) && reportCount > 0;
}

export function formatOwnerReportCount(reportCount: number | null | undefined): string | null {
  if (!hasOwnerReportCount(reportCount)) return null;

  const count = Math.floor(reportCount);
  return `${count.toLocaleString('en-US')} owner ${count === 1 ? 'report' : 'reports'}`;
}
