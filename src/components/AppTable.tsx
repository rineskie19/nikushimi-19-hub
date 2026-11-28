"use client";

import Link from "next/link";
import { useState } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable, type ColumnDef, type SortingState } from "@tanstack/react-table";
import { studioPath } from "@/lib/studio";

type AppRow = { slug: string; title: string; category: string; status: string; versions: number };
const columns: ColumnDef<AppRow>[] = [
  { accessorKey: "title", header: "App", cell: ({ row }) => <Link href={studioPath + "/apps/" + row.original.slug}>{row.original.title}</Link> },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <span className="pill">{row.original.status}</span> },
  { accessorKey: "versions", header: "Releases" },
];

export function AppTable({ apps }: { apps: AppRow[] }) {
  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data: apps, columns, state: { globalFilter: filter, sorting },
    onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getSortedRowModel: getSortedRowModel(),
  });
  return <div className="panel studio-panel">
    <input className="table-search" aria-label="Search catalog" placeholder="Search catalog" value={filter} onChange={(event) => setFilter(event.target.value)} />
    <div className="table-scroll"><table><thead>{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => {
      const sorted = header.column.getIsSorted();
      return <th key={header.id} aria-sort={sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none"}>
        <button onClick={header.column.getToggleSortingHandler()}>{flexRender(header.column.columnDef.header, header.getContext())}{sorted === "asc" ? " ↑" : sorted === "desc" ? " ↓" : ""}</button>
      </th>;
    })}</tr>)}</thead><tbody>
      {table.getRowModel().rows.map((row) => <tr key={row.id}>{row.getVisibleCells().map((cell) => <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}
      {table.getRowModel().rows.length === 0 && <tr><td colSpan={4}>No matching apps.</td></tr>}
    </tbody></table></div>
  </div>;
}
