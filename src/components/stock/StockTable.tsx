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
  type: 'material' | 'product';
}

export default function StockTable({ data, loading, type }: StockTableProps) {
  if (loading) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-md p-8 text-center text-gray-500">
        Loading stock...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-white border border-gray-200 rounded-md p-10 text-center flex flex-col items-center justify-center min-h-[150px]">
        <p className="text-gray-500 font-medium">No {type === 'material' ? 'raw material' : 'product'} data found</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <colgroup>
            <col style={{ width: '16.66%' }} />
            <col style={{ width: '16.66%' }} />
            <col style={{ width: '16.66%' }} />
            <col style={{ width: '16.66%' }} />
            <col style={{ width: '16.66%' }} />
            <col style={{ width: '16.66%' }} />
          </colgroup>

          <thead className="bg-gray-100 text-sm font-semibold text-gray-700 border-b">
            <tr>
              <th className="px-3 py-3 text-center">Date</th>
              {type === 'material' ? (
                <th className="px-3 py-3 text-center">Material</th>
              ) : (
                <th className="px-3 py-3 text-center">Size (mm)</th>
              )}
              <th className="px-3 py-3 text-center">Opening</th>
              {type === 'material' ? (
                <th className="px-3 py-3 text-center">Purchase</th>
              ) : (
                <>
                  <th className="px-3 py-3 text-center">Production</th>
                  <th className="px-3 py-3 text-center">Sales</th>
                </>
              )}
              <th className="px-3 py-3 text-center">Balance</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
            {data.map((row) => (
              <tr key={row.id} className="border-b even:bg-gray-50/50 hover:bg-blue-50 transition-colors">
                <td className="px-3 py-4 text-center whitespace-nowrap tabular-nums text-gray-500">
                  {format(new Date(row.date), 'dd-MM-yyyy')}
                </td>

                {type === 'material' ? (
                  <td className="px-3 py-4 text-center font-bold text-gray-900">
                    {row.material?.name || '-'}
                  </td>
                ) : (
                  <td className="px-3 py-4 text-center font-bold text-blue-700">
                    {row.size_mm} mm
                  </td>
                )}

                <td className="px-3 py-4 text-center tabular-nums">
                  {row.opening_stock.toFixed(2)}
                </td>

                {type === 'material' ? (
                  <td className="px-3 py-4 text-center tabular-nums font-medium text-green-600">
                    {row.purchase > 0 ? `+${row.purchase.toFixed(2)}` : '-'}
                  </td>
                ) : (
                  <>
                    <td className="px-3 py-4 text-center tabular-nums font-medium text-blue-600">
                      {row.production > 0 ? `+${row.production.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-3 py-4 text-center tabular-nums font-medium text-red-600">
                      {row.sales > 0 ? `-${row.sales.toFixed(2)}` : '-'}
                    </td>
                  </>
                )}

                <td className={`px-3 py-4 text-center tabular-nums font-bold bg-gray-50/30 ${row.balance >= 0 ? 'text-gray-900' : 'text-red-700'}`}>
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
