export function formatINR(amount: number): string {
  return '₹' + new Intl.NumberFormat('en-IN').format(Math.round(amount));
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  let code = 'YAI-';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generatePaymentId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = 'pay_';
  for (let i = 0; i < 14; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
