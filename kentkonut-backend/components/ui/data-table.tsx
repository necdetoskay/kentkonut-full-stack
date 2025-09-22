"use client"

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (row: TData) => void;
  isLoading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  loadingRowCount?: number;
  onRetry?: () => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  isLoading = false,
  error = null,
  emptyMessage = "Sonuç bulunamadı.",
  loadingRowCount = 5,
  onRetry,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  // Loading skeleton rows with varied widths for realism
  const renderLoadingRows = () => {
    const skeletonWidths = ['w-full', 'w-3/4', 'w-1/2', 'w-2/3', 'w-5/6'];

    return Array.from({ length: loadingRowCount }).map((_, index) => (
      <TableRow key={`loading-${index}`}>
        {columns.map((column, colIndex) => {
          // Vary skeleton widths for different columns and rows
          const widthClass = colIndex === 0 ? 'w-8' : // Checkbox column
                           colIndex === columns.length - 1 ? 'w-16' : // Actions column
                           skeletonWidths[(index + colIndex) % skeletonWidths.length];

          return (
            <TableCell key={`loading-cell-${index}-${colIndex}`}>
              <Skeleton className={`h-4 ${widthClass}`} />
            </TableCell>
          );
        })}
      </TableRow>
    ));
  };

  // Error state row
  const renderErrorRow = () => (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-32 text-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="text-red-500 text-sm font-medium">
            Hata: {error}
          </div>
          <div className="text-xs text-muted-foreground">
            Veriler yüklenirken bir sorun oluştu.
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2"
            >
              Tekrar Dene
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  // Empty state row
  const renderEmptyRow = () => (
    <TableRow>
      <TableCell colSpan={columns.length} className="h-24 text-center">
        <div className="flex flex-col items-center justify-center space-y-2">
          <div className="text-muted-foreground text-sm">
            {emptyMessage}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Ara..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup, groupIndex) => (
              <TableRow key={`header-group-${groupIndex}`}>
                {headerGroup.headers.map((header, headerIndex) => (
                  <TableHead key={`header-${groupIndex}-${headerIndex}`}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? renderLoadingRows() : error ? renderErrorRow() : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer hover:bg-muted" : ""}
                >
                  {row.getVisibleCells().map((cell, cellIndex) => (
                    <TableCell key={`cell-${row.id}-${cellIndex}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : renderEmptyRow()}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Önceki
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Sonraki
        </Button>
      </div>
    </div>
  );
}