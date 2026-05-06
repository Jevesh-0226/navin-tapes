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

export function formatIndianNumber(num: number): string {
  return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

export function formatIndianNumberWhole(num: number): string {
  return num.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}

export function formatDateIndian(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
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

// Print utility
export function printTable(
  title: string,
  data: any[],
  columns: { key: string; label: string }[]
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
        h1 {
          text-align: center;
          margin-bottom: 10px;
        }
        .print-date {
          text-align: right;
          font-size: 12px;
          color: #666;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th {
          background-color: #e5e7eb;
          border: 1px solid #d1d5db;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        td {
          border: 1px solid #d1d5db;
          padding: 10px 12px;
          text-align: left;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        @media print {
          body {
            margin: 0;
          }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="print-date">Printed on ${formatDateIndian(new Date())}</div>
      <table>
        <thead>
          <tr>
            ${columns.map(col => `<th>${col.label}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${columns.map(col => `<td>${row[col.key] || '-'}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
