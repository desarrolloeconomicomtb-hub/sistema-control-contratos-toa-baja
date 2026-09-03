export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '—';
  // Parse date string (handling YYYY-MM-DD cleanly without timezone shift)
  const parts = dateString.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Pagada':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Aprobada':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Pendiente':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Rechazada':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
}

export function getBudgetAlertLevel(percentUsed: number): {
  level: 'safe' | 'warning' | 'danger' | 'exceeded';
  textColor: string;
  bgColor: string;
  borderColor: string;
  label: string;
} {
  if (percentUsed >= 100) {
    return {
      level: 'exceeded',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-400',
      label: 'Excedido'
    };
  }
  if (percentUsed >= 90) {
    return {
      level: 'danger',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      label: 'Crítico (>90%)'
    };
  }
  if (percentUsed >= 75) {
    return {
      level: 'warning',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-400',
      label: 'Alerta (75%-90%)'
    };
  }
  return {
    level: 'safe',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    label: 'Óptimo (<75%)'
  };
}
