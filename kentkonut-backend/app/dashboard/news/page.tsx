"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  User,
  Tag,
  Image as ImageIcon,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingLink } from "@/components/ui/loading-link";
import { LoadingSkeleton } from "@/components/ui/loading";
import { toast } from "sonner";

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  published: boolean;
  publishedAt?: string;
  viewCount: number;
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  author: {
    id: string;
    name: string;
    email: string;
  };
  media?: {
    id: number;
    url: string;
    alt?: string;
  };
  tags: Array<{
    tag: {
      id: number;
      name: string;
      slug: string;
    };
  }>;
  _count: {
    comments: number;
    galleryItems: number;
  };
}

interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  active: boolean;
  newsCount: number;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<NewsCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<NewsItem | null>(null);

  // Fetch news data
  const fetchNews = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") {
        params.append("categoryId", selectedCategory);
      }
      if (selectedStatus !== "all") {
        params.append("published", selectedStatus);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await fetch(`/api/news?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setNews(data.news);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Haberler yüklenirken hata oluştu");
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/news-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchNews(), fetchCategories()]);
      setLoading(false);
    };
    loadData();
  }, [selectedCategory, selectedStatus, searchTerm]);

  const handleDeleteNews = async () => {
    if (!newsToDelete) return;

    try {
      const response = await fetch(`/api/news/${newsToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Haber başarıyla silindi");
        fetchNews();
      } else {
        toast.error("Haber silinirken hata oluştu");
      }
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Haber silinirken hata oluştu");
    } finally {
      setDeleteDialogOpen(false);
      setNewsToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return <LoadingSkeleton rows={8} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Haber Yönetimi</h1>
          <p className="text-muted-foreground mt-1">Tüm haberlerinizi tek bir yerden yönetin</p>
        </div>
        <div className="flex gap-2">
          <LoadingLink href="/dashboard/news/categories">
            <Button variant="outline">
              <Tag className="h-4 w-4 mr-2" />
              Kategoriler
            </Button>
          </LoadingLink>
          <LoadingLink href="/dashboard/news/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Haber
            </Button>
          </LoadingLink>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Haber ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="all">Tüm Kategoriler</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id.toString()}>
              {category.name} ({category.newsCount})
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="true">Yayında</option>
          <option value="false">Taslak</option>
        </select>
      </div>

      {/* News List */}
      <div className="grid gap-4">
        {news.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Henüz haber bulunmuyor</p>
            </CardContent>
          </Card>
        ) : (
          news.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.media ? (
                      <img
                        src={item.media.url}
                        alt={item.media.alt || item.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                          {item.title}
                        </h3>
                        {item.summary && (
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                            {item.summary}
                          </p>
                        )}
                        
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {item.author.name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(item.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.viewCount} görüntülenme
                          </div>
                        </div>

                        {/* Tags and Category */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{item.category.name}</Badge>
                          <Badge variant={item.published ? "default" : "outline"}>
                            {item.published ? "Yayında" : "Taslak"}
                          </Badge>
                          {item.tags && item.tags.length > 0 && item.tags.slice(0, 3).map((tagItem) => (
                            <Badge key={tagItem.tag.id} variant="outline" className="text-xs">
                              {tagItem.tag.name}
                            </Badge>
                          ))}
                          {item.tags && item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <LoadingLink href={`/dashboard/news/${item.id}/edit`}>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                          </LoadingLink>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setNewsToDelete(item);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Haberi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              "{newsToDelete?.title}" adlı haberi silmek istediğinizden emin misiniz? 
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteNews} className="bg-destructive text-destructive-foreground">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
