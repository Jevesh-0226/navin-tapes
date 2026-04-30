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
        Loading stock...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-md p-20 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-4xl mb-4 opacity-20">📊</div>
        <p className="text-gray-500 font-medium text-lg">No stock data for selected filters</p>
        <p className="text-gray-400 text-sm mt-1">Try adjusting your date or material filters</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden bg-white min-h-[300px]">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-sm font-semibold text-gray-700 border-b">
            <tr>
              <th className="px-4 py-4 text-center">Date</th>
              <th className="px-4 py-4 text-center">Material / Size</th>
              <th className="px-4 py-4 text-center">Opening</th>
              <th className="px-4 py-4 text-center">Purchase</th>
              <th className="px-4 py-4 text-center">Production</th>
              <th className="px-4 py-4 text-center">Sales</th>
              <th className="px-4 py-4 text-center">Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {data.map((row) => (
              <tr key={row.id} className="border-b even:bg-gray-50/50 hover:bg-blue-50 transition-colors">
                <td className="px-4 py-4 text-center whitespace-nowrap tabular-nums">
                  {format(new Date(row.date), 'dd-MM-yyyy')}
                </td>
                <td className="px-4 py-4 text-center font-medium text-gray-900">
                  {row.material ? row.material.name : `${row.size_mm}mm`}
                </td>
                <td className="px-4 py-4 text-center tabular-nums">
                  {row.opening_stock.toFixed(2)}
                </td>
                <td className="px-4 py-4 text-center tabular-nums">
                  {row.purchase > 0 ? row.purchase.toFixed(2) : '-'}
                </td>
                <td className={`px-4 py-4 text-center tabular-nums ${row.production < 0 ? 'text-red-600' : ''}`}>
                  {row.production !== 0 ? row.production.toFixed(2) : '-'}
                </td>
                <td className="px-4 py-4 text-center tabular-nums">
                  {row.sales > 0 ? `-${row.sales.toFixed(2)}` : '-'}
                </td>
                <td className={`px-4 py-4 text-center tabular-nums font-semibold bg-gray-50/30 ${row.balance > 0 ? 'text-green-600' : (row.balance < 0 ? 'text-red-600' : 'text-gray-900')}`}>
                  {row.balance.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
