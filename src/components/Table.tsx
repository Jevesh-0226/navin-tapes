interface Column {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
  className?: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  empty?: string;
  onRowClick?: (row: any) => void;
  actions?: (row: any) => React.ReactNode;
  compact?: boolean;
}

export default function Table({
  columns,
  data,
  loading = false,
  empty = 'No data available',
  onRowClick,
  actions,
  compact = false,
}: TableProps) {
  const getAlignClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const paddingClass = compact ? 'px-4 py-2' : 'px-5 py-3';
  const cellPaddingClass = compact ? 'px-4 py-2' : 'px-5 py-3';

  return (
    <div className="w-full border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-100 border-b border-gray-200 sticky top-0">
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{
                    width: col.width || col.minWidth,
                    minWidth: col.width || col.minWidth,
                  }}
                  className={`${paddingClass} font-semibold text-slate-900 text-left text-sm border-r border-gray-200 last:border-r-0 ${getAlignClass(col.align)}`}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th className={`${paddingClass} font-semibold text-slate-900 text-sm border-r border-gray-200 whitespace-nowrap`}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className={`${cellPaddingClass} text-center text-slate-500`}
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className={`${cellPaddingClass} text-center text-slate-500`}
                >
                  {empty}
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-200 hover:bg-slate-50 transition-colors align-middle"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(col => (
                    <td
                      key={`${idx}-${col.key}`}
                      style={{
                        width: col.width || col.minWidth,
                        minWidth: col.width || col.minWidth,
                      }}
                      className={`${cellPaddingClass} text-slate-700 border-r border-gray-200 last:border-r-0 ${getAlignClass(col.align)} text-sm`}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className={`${cellPaddingClass} border-r border-gray-200 text-center`}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
