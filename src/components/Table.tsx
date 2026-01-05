import React from "react";

type Col = { key: string; label: string };

export default function Table<T>({
  columns,
  data,
}: {
  columns: Col[];
  data: T[];
}) {
  return (
    <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
      <table className="w-full min-w-[800px]">
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="text-left px-4 py-3 text-sm text-slate-600"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any, idx) => (
            <tr
              key={idx}
              className="border-t last:border-b hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              {columns.map((c) => (
                <td className="px-4 py-3 text-sm" key={c.key}>
                  {row[c.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
