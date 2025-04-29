"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Eye, MousePointer, Search } from "lucide-react";

interface BannerStat {
  id: string;
  name: string;
  imageUrl: string;
  views: number;
  clicks: number;
  ctr: number;
  isActive: boolean;
  lastUpdated: string;
}

export function BannerStatsTable() {
  const [stats, setStats] = useState<BannerStat[]>([]);
  const [filteredStats, setFilteredStats] = useState<BannerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("views");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const fetchBannerStats = async () => {
      try {
        // Fetch banner statistics from API
        const response = await fetch("/api/statistics/banners");
        
        if (!response.ok) {
          throw new Error("Failed to fetch banner statistics");
        }
        
        const data = await response.json();
        setStats(data);
        setFilteredStats(data);
      } catch (error) {
        console.error("Error fetching banner statistics:", error);
        // Use sample data if API fails
        const sampleData: BannerStat[] = Array.from({ length: 8 }, (_, i) => ({
          id: `banner-${i + 1}`,
          name: `Banner ${i + 1}`,
          imageUrl: `/banner-${i + 1}.jpg`,
          views: Math.floor(Math.random() * 10000),
          clicks: Math.floor(Math.random() * 1000),
          ctr: Math.random() * 10,
          isActive: Math.random() > 0.3,
          lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        }));
        setStats(sampleData);
        setFilteredStats(sampleData);
      } finally {
        setLoading(false);
      }
    };

    fetchBannerStats();
  }, []);

  useEffect(() => {
    // Filter stats based on search query
    const filtered = stats.filter(stat => 
      stat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Sort filtered stats
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortBy as keyof BannerStat];
      const bValue = b[sortBy as keyof BannerStat];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc' 
          ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
          : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }
      
      return 0;
    });
    
    setFilteredStats(sorted);
  }, [stats, searchQuery, sortBy, sortDirection]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Banner İstatistikleri</CardTitle>
        <CardDescription>
          Tüm bannerların performans metrikleri
        </CardDescription>
        <div className="flex justify-between items-center mt-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Banner ara..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(value) => {
              setSortBy(value);
              setSortDirection('desc');
            }}
          >
            <SelectTrigger className="w-[180px] ml-4">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">İsim</SelectItem>
              <SelectItem value="views">Görüntülenme</SelectItem>
              <SelectItem value="clicks">Tıklanma</SelectItem>
              <SelectItem value="ctr">CTR</SelectItem>
              <SelectItem value="isActive">Durum</SelectItem>
              <SelectItem value="lastUpdated">Son Güncelleme</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium"
                    onClick={() => handleSort('name')}
                  >
                    Banner Adı {getSortIcon('name')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium"
                    onClick={() => handleSort('isActive')}
                  >
                    Durum {getSortIcon('isActive')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-1 p-0 font-medium"
                    onClick={() => handleSort('views')}
                  >
                    <Eye className="h-4 w-4" /> Görüntülenme {getSortIcon('views')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="flex items-center gap-1 p-0 font-medium"
                    onClick={() => handleSort('clicks')}
                  >
                    <MousePointer className="h-4 w-4" /> Tıklanma {getSortIcon('clicks')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium"
                    onClick={() => handleSort('ctr')}
                  >
                    CTR (%) {getSortIcon('ctr')}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button 
                    variant="ghost" 
                    className="p-0 font-medium"
                    onClick={() => handleSort('lastUpdated')}
                  >
                    Son Güncelleme {getSortIcon('lastUpdated')}
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-6 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : filteredStats.length > 0 ? (
                filteredStats.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.name}</TableCell>
                    <TableCell>
                      <Badge variant={stat.isActive ? "default" : "secondary"}>
                        {stat.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell>{stat.views.toLocaleString()}</TableCell>
                    <TableCell>{stat.clicks.toLocaleString()}</TableCell>
                    <TableCell>{stat.ctr.toFixed(2)}%</TableCell>
                    <TableCell>{formatDate(stat.lastUpdated)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Sonuç bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 