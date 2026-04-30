import React from 'react';
import { format } from 'date-fns';

interface StockEntry {
  id: number;
  date: string | Date;
  materialId: number | null;
  size_mm: number | null;
  opening_stock: number;
  purchase: number;
  production: number;
  sales: number;
  balance: number;
  material?: {
    name: string;
  };
}

interface StockTableProps {
  data: StockEntry[];
  loading: boolean;
}

export default function StockTable({ data, loading }: StockTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-md p-8 text-center text-gray-500">
        Loading stock ledger...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-md p-8 text-center text-gray-500">
        No stock data available
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-200 rounded-md overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm text-gray-700">
          <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left font-semibold border-r border-gray-200 w-32">Date</th>
              <th className="px-3 py-2 text-left font-semibold border-r border-gray-200">Material / Size</th>
              <th className="px-3 py-2 text-right font-semibold border-r border-gray-200 w-28">Opening</th>
              <th className="px-3 py-2 text-right font-semibold border-r border-gray-200 w-28 text-green-700">Purchase</th>
              <th className="px-3 py-2 text-right font-semibold border-r border-gray-200 w-28">Production</th>
              <th className="px-3 py-2 text-right font-semibold border-r border-gray-200 w-28 text-red-700">Sales</th>
              <th className="px-3 py-2 text-right font-bold bg-gray-50 w-32">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2 border-r border-gray-200 whitespace-nowrap">
                  {format(new Date(row.date), 'dd-MM-yyyy')}
                </td>
                <td className="px-3 py-2 border-r border-gray-200 font-medium">
                  {row.material ? row.material.name : `${row.size_mm}mm`}
                </td>
                <td className="px-3 py-2 border-r border-gray-200 text-right font-mono">
                  {row.opening_stock.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2 border-r border-gray-200 text-right font-mono bg-green-50/30 text-green-800">
                  {row.purchase > 0 ? `+${row.purchase.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="px-3 py-2 border-r border-gray-200 text-right font-mono">
                  {row.production > 0 ? row.production.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                </td>
                <td className="px-3 py-2 border-r border-gray-200 text-right font-mono bg-red-50/30 text-red-800">
                  {row.sales > 0 ? `-${row.sales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                </td>
                <td className="px-3 py-2 text-right font-bold bg-gray-50/50 text-slate-900 border-l border-gray-100">
                  {row.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
