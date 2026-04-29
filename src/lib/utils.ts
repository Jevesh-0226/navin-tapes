// Utility functions for formatting and calculations

export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toFixed(decimals);
}

export function parseNumber(str: string): number {
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function calculateTotal(
  quantity: number,
  rate: number
): number {
  return quantity * rate;
}

export function calculateBalance(
  opening: number,
  inward: number,
  production: number,
  delivery: number
): number {
  return opening + inward + production - delivery;
}

export function calculateProductionTotal(
  tapes: number,
  metersPerTape: number
): number {
  return tapes * metersPerTape;
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getYesterday(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

export function formatCurrency(num: number): string {
  return `₹${num.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatKg(num: number): string {
  return `${num.toFixed(2)} kg`;
}

export function formatMeters(num: number): string {
  return `${num.toLocaleString()} m`;
}

// Keyboard event helpers
export function isEnter(key: string): boolean {
  return key === 'Enter';
}

export function isTab(key: string): boolean {
  return key === 'Tab';
}

export function isEscape(key: string): boolean {
  return key === 'Escape';
}

export function isArrowKey(key: string): boolean {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
}
