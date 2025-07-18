// Shared Corporate Table Component
// Reusable table component for all corporate entities with consistent styling and functionality

"use client";

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/ui/loading';
import { 
  Edit, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableErrorFallback } from './CorporateErrorBoundary';

export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: 'default' | 'destructive' | 'secondary';
  disabled?: (item: T) => boolean;
  hidden?: (item: T) => boolean;
}

export interface CorporateTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
  onRowClick?: (item: T) => void;
  className?: string;
  showRowNumbers?: boolean;
  stickyHeader?: boolean;
}

function CorporateTable<T extends { id: string; isActive?: boolean }>({
  data,
  columns,
  actions = [],
  loading = false,
  error = null,
  emptyMessage = "Veri bulunamadı",
  onSort,
  sortKey,
  sortDirection,
  onRowClick,
  className = "",
  showRowNumbers = false,
  stickyHeader = false,
}: CorporateTableProps<T>) {
  // Handle sorting
  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = 
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, newDirection);
  };

  // Render sort icon
  const renderSortIcon = (key: string) => {
    if (sortKey !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  // Get cell value
  const getCellValue = (item: T, column: TableColumn<T>) => {
    if (column.render) {
      return column.render(item[column.key as keyof T], item);
    }
    
    const value = item[column.key as keyof T];
    
    // Handle special cases
    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Aktif" : "Pasif"}
        </Badge>
      );
    }
    
    if (value === null || value === undefined || value === '') {
      return <span className="text-muted-foreground">-</span>;
    }
    
    return String(value);
  };

  // Get cell alignment class
  const getCellAlignment = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  // Error state
  if (error) {
    return <TableErrorFallback error={new Error(error)} retry={() => window.location.reload()} />;
  }

  // Loading state
  if (loading) {
    return <LoadingSkeleton rows={6} />;
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-md border ${className}`}>
      <Table>
        <TableHeader className={stickyHeader ? "sticky top-0 bg-background" : ""}>
          <TableRow>
            {showRowNumbers && (
              <TableHead className="w-16">#</TableHead>
            )}
            {columns.map((column, index) => (
              <TableHead 
                key={index} 
                className={`${column.className || ''} ${getCellAlignment(column.align)}`}
              >
                {column.sortable ? (
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(String(column.key))}
                    className="h-auto p-0 font-medium hover:bg-transparent"
                  >
                    {column.label}
                    {renderSortIcon(String(column.key))}
                  </Button>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
            {actions.length > 0 && (
              <TableHead className="w-24 text-right">İşlemler</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow 
              key={item.id}
              className={`
                ${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                ${item.isActive === false ? 'opacity-60' : ''}
              `}
              onClick={() => onRowClick?.(item)}
            >
              {showRowNumbers && (
                <TableCell className="font-medium text-muted-foreground">
                  {index + 1}
                </TableCell>
              )}
              {columns.map((column, columnIndex) => (
                <TableCell 
                  key={columnIndex}
                  className={`${column.className || ''} ${getCellAlignment(column.align)}`}
                >
                  {getCellValue(item, column)}
                </TableCell>
              ))}
              {actions.length > 0 && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {actions.filter(action => !action.hidden?.(item)).map((action, actionIndex) => {
                      const isDisabled = action.disabled?.(item);
                      
                      if (actions.length <= 2) {
                        // Show buttons directly for 2 or fewer actions
                        return (
                          <Button
                            key={actionIndex}
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(item);
                            }}
                            disabled={isDisabled}
                            className={
                              action.variant === 'destructive' 
                                ? 'text-destructive hover:text-destructive' 
                                : ''
                            }
                          >
                            {action.icon}
                          </Button>
                        );
                      }
                      
                      return null;
                    })}
                    
                    {actions.length > 2 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.filter(action => !action.hidden?.(item)).map((action, actionIndex) => {
                            const isDisabled = action.disabled?.(item);
                            
                            return (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(item)}
                                disabled={isDisabled}
                                className={
                                  action.variant === 'destructive' 
                                    ? 'text-destructive focus:text-destructive' 
                                    : ''
                                }
                              >
                                {action.icon && (
                                  <span className="mr-2">{action.icon}</span>
                                )}
                                {action.label}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Pre-configured action sets for common use cases
export const StandardActions = {
  viewEditDelete: <T extends { id: string }>(
    onView: (item: T) => void,
    onEdit: (item: T) => void,
    onDelete: (item: T) => void
  ): TableAction<T>[] => [
    {
      label: 'Görüntüle',
      icon: <Eye className="h-4 w-4" />,
      onClick: onView,
    },
    {
      label: 'Düzenle',
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      label: 'Sil',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'destructive' as const,
    },
  ],

  editDelete: <T extends { id: string }>(
    onEdit: (item: T) => void,
    onDelete: (item: T) => void
  ): TableAction<T>[] => [
    {
      label: 'Düzenle',
      icon: <Edit className="h-4 w-4" />,
      onClick: onEdit,
    },
    {
      label: 'Sil',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: onDelete,
      variant: 'destructive' as const,
    },
  ],
};

// Common column renderers
export const ColumnRenderers = {
  status: (isActive: boolean) => (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Aktif" : "Pasif"}
    </Badge>
  ),

  truncatedText: (text: string, maxLength: number = 50) => (
    <span title={text}>
      {text.length > maxLength ? `${text.substring(0, maxLength)}...` : text}
    </span>
  ),

  date: (date: string) => new Date(date).toLocaleDateString('tr-TR'),

  url: (url: string) => (
    <code className="text-xs bg-muted px-1 py-0.5 rounded">
      {url}
    </code>
  ),

  email: (email: string) => (
    <a 
      href={`mailto:${email}`}
      className="text-blue-600 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {email}
    </a>
  ),

  phone: (phone: string) => (
    <a 
      href={`tel:${phone}`}
      className="text-blue-600 hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      {phone}
    </a>
  ),
};

export default CorporateTable;
