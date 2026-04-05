"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { cn } from "@/utils/cn";
import { ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import Input from "@mui/joy/Input";

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  onRowClick?: (row: T) => void;
  getRowClassName?: (row: T) => string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  noResultsMessage?: string;
  showSearch?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  onRowClick,
  getRowClassName,
  searchPlaceholder = "Suchen…",
  emptyMessage = "Keine Daten vorhanden",
  noResultsMessage = "Keine Treffer für diese Suche",
  showSearch = true,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex h-full w-full flex-col">
      {showSearch && (
        <div className="flex items-center justify-end border-b border-[#0f172b]/10 px-4 py-2.5">
          <Input
            size="sm"
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            startDecorator={<Search className="h-3.5 w-3.5 text-[#57688e]" />}
            sx={{
              width: 240,
              "--Input-focusedHighlight": "#155dfc",
              fontSize: "0.75rem",
            }}
          />
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-[#0f172b]/10 bg-[#f8f9fb]"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={cn(
                      "px-4 py-2.5 text-left text-[0.7rem] font-semibold text-[#57688e] uppercase tracking-wide whitespace-nowrap",
                      header.column.getCanSort() &&
                        "cursor-pointer select-none hover:text-[#0f172b]",
                    )}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="inline-flex items-center gap-1">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() &&
                        (header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        ))}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-[#0f172b]/5">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-xs text-[#57688e]"
                >
                  {data.length === 0 ? emptyMessage : noResultsMessage}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row.original)}
                  className={cn(
                    "hover:bg-[#155dfc]/3 transition-colors",
                    onRowClick && "cursor-pointer",
                    getRowClassName?.(row.original),
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2.5 text-[#0f172b] whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          {table
            .getFooterGroups()
            .some((fg) =>
              fg.headers.some((h) => h.column.columnDef.footer),
            ) && (
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr
                  key={footerGroup.id}
                  className="border-t border-[#0f172b]/10 bg-[#f8f9fb]"
                >
                  {footerGroup.headers.map((header) => (
                    <td
                      key={header.id}
                      className="px-4 py-2.5 text-xs font-semibold text-[#0f172b] whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.footer,
                            header.getContext(),
                          )}
                    </td>
                  ))}
                </tr>
              ))}
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
