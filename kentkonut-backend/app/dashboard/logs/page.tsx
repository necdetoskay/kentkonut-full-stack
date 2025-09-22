import { db } from '@/lib/db';
import { checkAdminAuth, handleServerError } from '@/utils/corporate-cards-utils';
import { format } from 'date-fns';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';

// Zod schema for query parameters validation
const querySchema = z.object({
  page: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(1).default(1)
  ).optional(),
  limit: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().int().min(1).max(100).default(10)
  ).optional(),
  level: z.enum(['info', 'warn', 'error', 'all']).optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  orderBy: z.enum(['timestamp', 'level', 'context']).default('timestamp').optional(),
  orderDirection: z.enum(['asc', 'desc']).default('desc').optional(),
});

export default async function LogsPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const authResult = await checkAdminAuth();
  if (!authResult.success) {
    // Render an error page or redirect if not authorized
    return <div className="text-center text-red-500 py-8">Yetkiniz yok veya oturumunuz sona erdi.</div>;
  }

  let parsedQuery;
  try {
    const defaultQueryParams = {
      page: '1',
      limit: '10',
      orderBy: 'timestamp',
      orderDirection: 'desc',
    };

    const combinedSearchParams = { ...defaultQueryParams, ...searchParams };

    parsedQuery = querySchema.parse(combinedSearchParams);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return <div className="text-center text-red-500 py-8">Geçersiz filtre parametreleri: {error.errors.map(e => e.message).join(', ')}</div>;
    }
    return <div className="text-center text-red-500 py-8">Bilinmeyen bir hata oluştu.</div>;
  }

  const { page, limit, level, search, startDate, endDate, orderBy, orderDirection } = parsedQuery;

  const skip = (page! - 1) * limit!;

  const where: any = {};

  if (level && level !== 'all') {
    where.level = level;
  }

  if (search) {
    where.OR = [
      { message: { contains: search, mode: 'insensitive' } },
      { context: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (startDate) {
    where.timestamp = { ...where.timestamp, gte: new Date(startDate) };
  }

  if (endDate) {
    where.timestamp = { ...where.timestamp, lte: new Date(endDate) };
  }

  const totalCount = await db.applicationLog.count({ where });
  const totalPages = Math.ceil(totalCount / limit!);

  const logs = await db.applicationLog.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [orderBy!]: orderDirection!,
    },
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Uygulama Logları</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Mesaj veya bağlamda ara..."
            defaultValue={search || ''}
            name="search"
          />
          <Select
            defaultValue={level || ''}
            name="level"
          >
            <SelectTrigger>
              <SelectValue placeholder="Seviye seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="info">Bilgi</SelectItem>
              <SelectItem value="warn">Uyarı</SelectItem>
              <SelectItem value="error">Hata</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="date"
            placeholder="Başlangıç Tarihi"
            defaultValue={startDate || ''}
            name="startDate"
          />
          <Input
            type="date"
            placeholder="Bitiş Tarihi"
            defaultValue={endDate || ''}
            name="endDate"
          />
          <Button type="submit">Filtrele</Button>
        </CardContent>
      </Card>

      {logs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">Gösterilecek log bulunamadı.</div>
      )}

      {logs.length > 0 && (
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zaman Damgası</TableHead>
                  <TableHead>Seviye</TableHead>
                  <TableHead>Mesaj</TableHead>
                  <TableHead>Bağlam</TableHead>
                  <TableHead>Detaylar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{format(new Date(log.timestamp), 'dd.MM.yyyy HH:mm:ss')}</TableCell>
                    <TableCell>{log.level}</TableCell>
                    <TableCell>{log.message}</TableCell>
                    <TableCell>{log.context || '-'}</TableCell>
                    <TableCell>{log.details ? JSON.stringify(log.details) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={`/dashboard/logs?${new URLSearchParams({ ...searchParams, page: (page! - 1).toString() }).toString()}`}
                    disabled={page === 1}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <Button
                      variant={page === index + 1 ? 'default' : 'outline'}
                      href={`/dashboard/logs?${new URLSearchParams({ ...searchParams, page: (index + 1).toString() }).toString()}`}
                    >
                      {index + 1}
                    </Button>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href={`/dashboard/logs?${new URLSearchParams({ ...searchParams, page: (page! + 1).toString() }).toString()}`}
                    disabled={page === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
