
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Filter, Search, MapPin, Calendar } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { API_BASE_URL } from '../config/environment';

// Backend'den ongoing projeleri fetch et
const ProjectsPage = () => {
  const [ongoingProjects, setOngoingProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ongoing');
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [activeCity, setActiveCity] = useState('Tümü');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  
  // Logic for filtering projects
  const filterProjects = (projects: any[]) => {
    return projects.filter(project => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        project.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by category
      const matchesCategory = activeCategory === 'Tümü' || 
        project.category === activeCategory;
      
      // Filter by city
      const matchesCity = activeCity === 'Tümü' || 
        project.location.split(',')[0].trim() === activeCity;
      
      return matchesSearch && matchesCategory && matchesCity;
    });
  };

  // completedProjects ve diğerleri için ileride fetch ile değiştirilebilir
  
  // Get current projects for pagination
  const currentProjects = activeTab === 'ongoing' ? ongoingProjects : [];
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentPageProjects = currentProjects.slice(indexOfFirstProject, indexOfLastProject);
  
  // Logic for pagination
  const totalPages = Math.ceil(currentProjects.length / projectsPerPage);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const API_BASE_URL_LOCAL = API_BASE_URL;
    const fetchOngoing = async (search = '') => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects?status=ONGOING&limit=12${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        if (!res.ok) throw new Error('Projeler alınamadı');
        const data = await res.json();
        setOngoingProjects(data.projects || []);
      } catch (err: any) {
        setError(err.message || 'Bilinmeyen hata');
      } finally {
        setLoading(false);
      }
    };
    const fetchCompleted = async (search = '') => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects?status=COMPLETED&limit=12${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        if (!res.ok) throw new Error('Projeler alınamadı');
        const data = await res.json();
        setCompletedProjects(data.projects || []);
      } catch (err: any) {
        setError(err.message || 'Bilinmeyen hata');
      }
    };
    const fetchAll = async (search = '') => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/projects?limit=24${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        if (!res.ok) throw new Error('Projeler alınamadı');
        const data = await res.json();
        setAllProjects(data.projects || []);
      } catch (err: any) {
        setError(err.message || 'Bilinmeyen hata');
      }
    };
    fetchOngoing();
    fetchCompleted();
    fetchAll();
  }, []);

  // Arama terimi değiştiğinde ilgili sekmede fetch
  useEffect(() => {
    if (searchTerm === '') return;
    const API_BASE_URL_LOCAL = API_BASE_URL;
    if (activeTab === 'ongoing') {
      fetch(`${API_BASE_URL}/api/projects?status=ONGOING&limit=12&search=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(data => setOngoingProjects(data.projects || []));
    } else if (activeTab === 'completed') {
      fetch(`${API_BASE_URL}/api/projects?status=COMPLETED&limit=12&search=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(data => setCompletedProjects(data.projects || []));
    } else if (activeTab === 'all') {
      fetch(`${API_BASE_URL}/api/projects?limit=24&search=${encodeURIComponent(searchTerm)}`)
        .then(res => res.json())
        .then(data => setAllProjects(data.projects || []));
    }
  }, [searchTerm, activeTab]);
  
  return (
    <div className="min-h-screen bg-white">
      
      
      <section className="py-16">
        <div className="kent-container">
          {/* Search and Filters */}
          <div className="bg-white shadow-md rounded-lg p-6 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Proje Ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-kentblue"
                />
              </div>
              
              {/* Kategori ve şehir filtreleri kaldırıldı, backend filtreli veri döndüğü için gerek yok */}
            </div>
          </div>
          
          {/* Project Tabs */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => {
            setActiveTab(value);
            setCurrentPage(1);
          }} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-gray-200">
                <TabsTrigger 
                  value="all"
                  className="data-[state=active]:bg-kentblue data-[state=active]:text-white"
                >
                  Tümü
                </TabsTrigger>
                <TabsTrigger 
                  value="ongoing"
                  className="data-[state=active]:bg-kentblue data-[state=active]:text-white"
                >
                  Devam Eden Projeler
                </TabsTrigger>
                <TabsTrigger 
                  value="completed"
                  className="data-[state=active]:bg-kentblue data-[state=active]:text-white"
                >
                  Tamamlanan Projeler
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="mt-0">
              {loading ? (
                <div className="text-center py-10"><p>Yükleniyor...</p></div>
              ) : error ? (
                <div className="text-center py-10"><p className="text-red-500">{error}</p></div>
              ) : allProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allProjects.map((project) => (
                    <ProjectCard key={project.id} project={mapProjectToCard(project)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Bu kriterlere uygun proje bulunamadı.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="ongoing" className="mt-0">
              {loading ? (
                <div className="text-center py-10"><p>Yükleniyor...</p></div>
              ) : error ? (
                <div className="text-center py-10"><p className="text-red-500">{error}</p></div>
              ) : ongoingProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoingProjects.map((project) => (
                    <ProjectCard key={project.id} project={mapProjectToCard(project)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Bu kriterlere uygun proje bulunamadı.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              {loading ? (
                <div className="text-center py-10"><p>Yükleniyor...</p></div>
              ) : error ? (
                <div className="text-center py-10"><p className="text-red-500">{error}</p></div>
              ) : completedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {completedProjects.map((project) => (
                    <ProjectCard key={project.id} project={mapProjectToCard(project)} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Bu kriterlere uygun tamamlanan proje bulunamadı.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
      
      
    </div>
  );
};

interface ProjectCardProps {
  project: {
    id: number;
    title: string;
    location: string;
    yil?: string;
    blokDaireSayisi?: string;
    description: string;
    status: string;
    completionDate: string;
    image: string;
    url: string;
    features: string[];
    area: string;
    priceRange: string;
    category: string;
  };
}

// API'den gelen projeyi ProjectCard'ın beklediği yapıya dönüştür
function mapProjectToCard(project: any): ProjectCardProps['project'] {
  const backendBase = API_BASE_URL;
  let image = project.media?.url
    ? (project.media.url.startsWith('http')
        ? project.media.url
        : backendBase + project.media.url)
    : 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?auto=format&fit=crop&w=800&q=80';
  return {
    id: project.id,
    title: project.title,
    location: [project.province, project.district].filter(Boolean).join(', ') || '-',
    yil: project.yil || undefined,
    blokDaireSayisi: project.blokDaireSayisi || undefined,
    description: project.summary || project.content?.slice(0, 120) || '',
    status: project.status === 'ONGOING' ? 'İnşaat Devam Ediyor' : 'Tamamlandı',
    completionDate: project.publishedAt ? new Date(project.publishedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) : '-',
    image,
    url: `/projeler/${project.slug}`,
    features: project.features || [],
    area: project.area || '-',
    priceRange: project.priceRange || '',
    category: project.category || '-',
  };
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-56 w-full overflow-hidden">
        <img 
          src={project.image} 
          alt={project.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-0 right-0 bg-kentgold text-black font-medium text-sm py-1 px-3">
          {project.status}
        </div>
        <div className="absolute bottom-0 left-0 bg-kentblue/80 text-white text-sm py-1 px-3">
          {project.category}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-kentblue">{project.title}</h3>
        <div className="flex items-center mb-1 text-sm text-gray-500">
          <MapPin className="h-4 w-4 mr-1 text-kentgold" />
          {project.location}
        </div>
        {project.yil && (
          <div className="flex items-center mb-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1 text-kentgold" />
            {project.yil}
          </div>
        )}
        {project.blokDaireSayisi && (
          <div className="flex items-center mb-3 text-sm text-gray-500">
            <ImageIcon className="h-4 w-4 mr-1 text-kentgold" />
            {project.blokDaireSayisi}
          </div>
        )}
        <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
        
        <div className="border-t border-b border-gray-100 py-3 my-3">
          <div className="flex flex-wrap gap-1">
            {project.features.slice(0, 4).map((feature, idx) => (
              <span 
                key={idx}
                className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {feature}
              </span>
            ))}
            {project.features.length > 4 && (
              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{project.features.length - 4}
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div>
            <span className="text-gray-500">Alan:</span>
            <p className="font-medium">{project.area}</p>
          </div>
          <div>
            <span className="text-gray-500">Teslim:</span>
            <p className="font-medium">{project.completionDate}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm font-medium text-kentblue">
            {project.priceRange}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-kentblue hover:text-kentblue/80 hover:bg-gray-100"
            asChild
          >
            <a href={project.url} className="flex items-center">
              Detaylar <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

interface PaginationSectionProps {
  currentPage: number;
  totalPages: number;
  paginate: (pageNumber: number) => void;
}

const PaginationSection = ({ currentPage, totalPages, paginate }: PaginationSectionProps) => {
  return (
    <Pagination className="mt-10">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => currentPage > 1 && paginate(currentPage - 1)} 
            className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
        
        {[...Array(totalPages)].map((_, idx) => {
          const pageNumber = idx + 1;
          // Show current page, first, last, and one before/after current
          if (
            pageNumber === 1 || 
            pageNumber === totalPages || 
            pageNumber === currentPage || 
            pageNumber === currentPage - 1 || 
            pageNumber === currentPage + 1
          ) {
            return (
              <PaginationItem key={idx}>
                <PaginationLink 
                  isActive={pageNumber === currentPage} 
                  onClick={() => paginate(pageNumber)}
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          } else if (
            (pageNumber === currentPage - 2 && currentPage > 3) || 
            (pageNumber === currentPage + 2 && currentPage < totalPages - 2)
          ) {
            return <PaginationItem key={idx}><span className="px-2">...</span></PaginationItem>;
          }
          return null;
        })}
        
        <PaginationItem>
          <PaginationNext 
            onClick={() => currentPage < totalPages && paginate(currentPage + 1)} 
            className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ProjectsPage;
