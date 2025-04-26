"use client"

import React, { useState, useContext } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { DetailDialogContext } from "@/app/dashboard/banners/[id]/page"
import { GroupDialogContext } from "@/app/dashboard/banners/page"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (row: TData) => void
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  let isAnyDialogOpen = false
  
  try {
    const groupContext = useContext(GroupDialogContext)
    if (groupContext && groupContext.isDialogOpen) {
      isAnyDialogOpen = true
    }
  } catch (error) {
    // GroupDialogContext mevcut değil, görmezden gel
  }
  
  try {
    const detailContext = useContext(DetailDialogContext)
    if (detailContext && detailContext.isDialogOpen) {
      isAnyDialogOpen = true
    }
  } catch (error) {
    // DetailDialogContext mevcut değil, görmezden gel
  }

  const handleRowClick = (row: TData) => {
    if (isAnyDialogOpen) {
      return
    }
    
    if (onRowClick) {
      onRowClick(row)
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                  className={cn(onRowClick && "cursor-pointer hover:bg-secondary/50")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage || "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 