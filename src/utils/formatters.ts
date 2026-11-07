export function formatCFA(amount: number): string {
  if (isNaN(amount)) return '0 F CFA';
  return Math.round(amount).toLocaleString('fr-FR') + ' F CFA';
}

export function formatNum(amount: number): string {
  if (isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('fr-FR');
}

export function formatDateFr(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeFr(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
}
