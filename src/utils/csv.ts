export function toCSV(rows: any[], columns: string[]) {
  const header = columns.join(",") + "\n";
  const lines = rows
    .map((r) => columns.map((c) => JSON.stringify(r[c] ?? "")).join(","))
    .join("\n");
  return header + lines;
}
