
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { apiClient } from '../services/apiClient';

const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';

// Bu fonksiyon artık kullanılmıyor - ProjectsPage.tsx'teki mantığı kullanacağız

const FeaturedProjects = () => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [ongoingProjects, setOngoingProjects] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ongoing
        const ongoingRes = await apiClient.get('/api/projects?status=ONGOING&limit=6');
        let ongoingArr = [];
        if (Array.isArray(ongoingRes.data)) {
          ongoingArr = ongoingRes.data;
        } else if (ongoingRes.data && Array.isArray(ongoingRes.data.data)) {
          ongoingArr = ongoingRes.data.data;
        } else if (ongoingRes.data && Array.isArray(ongoingRes.data.projects)) {
          ongoingArr = ongoingRes.data.projects;
        }
        setOngoingProjects(ongoingArr);

        // Completed
        const completedRes = await apiClient.get('/api/projects?status=COMPLETED&limit=6');
        let completedArr = [];
        if (Array.isArray(completedRes.data)) {
          completedArr = completedRes.data;
        } else if (completedRes.data && Array.isArray(completedRes.data.data)) {
          completedArr = completedRes.data.data;
        } else if (completedRes.data && Array.isArray(completedRes.data.projects)) {
          completedArr = completedRes.data.projects;
        }
        setCompletedProjects(completedArr);
      } catch (err) {
        setError('Projeler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section className="py-16 bg-gray-50">
      <div className="kent-container">
        <div className="text-center mb-12">
          <h2 className="section-title">Projelerimiz</h2>
          <p className="mt-4 text-gray-600 max-w-3xl mx-auto">
            Kent Konut olarak, modern mimari anlayışımız ve yenilikçi tasarım yaklaşımımızla hayata geçirdiğimiz 
            prestijli konut ve ticari projelerimiz.
          </p>
        </div>

        <Tabs defaultValue="ongoing" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-gray-200">
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

          <TabsContent value="ongoing" className="mt-0">
            {loading ? (
              <div className="text-center py-8">Projeler yükleniyor...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {ongoingProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {loading ? (
              <div className="text-center py-8">Projeler yükleniyor...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-10">
          <Button 
            variant="outline" 
            className="border-kentblue text-kentblue hover:bg-kentblue hover:text-white"
            asChild
          >
            <a href="/projeler">Tüm Projelerimizi İnceleyin</a>
          </Button>
        </div>
      </div>
    </section>
  );
};

interface ProjectCardProps {
  project: any;
}

const statusLabelMap: Record<string, string> = {
  ONGOING: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  // ProjectsPage.tsx'teki ile aynı mantığı kullan
  const backendBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3010';
  let imageUrl = project.image || (project.media?.url
    ? (project.media.url.startsWith('http')
        ? project.media.url
        : backendBase + project.media.url)
    : '/projects/default.jpg');

  const statusRaw = project.status || project.statusLabel;
  const statusLabel = statusLabelMap[statusRaw] || statusRaw || '';
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md motion-safe:hover:shadow-2xl motion-safe:hover:-translate-y-1 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease p-4 sm:p-6">
      <div className="relative w-full h-44 sm:h-56 overflow-hidden">
        <img 
          src={imageUrl}
          alt={project.title || project.name} 
          className="w-full h-full object-cover motion-safe:hover:scale-105 motion-safe:transition-transform motion-safe:duration-500"
          loading="lazy"
        />
        <div className="absolute top-0 right-0 bg-kentgold text-black font-medium text-sm py-1 px-3">
          {statusLabel}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-lg md:text-xl font-bold mb-2 text-kentblue truncate">{project.title || project.name}</h3>
        <p className="text-xs md:text-sm text-gray-500 mb-3 truncate">{project.locationName || project.location || ''}</p>
        <p className="text-gray-600 mb-4 text-sm md:text-base line-clamp-3">{project.summary || project.description || ''}</p>
        <div className="flex items-center justify-between mt-4 sm:mt-6">
          <span className="text-sm text-gray-500">
            <strong>Teslim:</strong> {project.completionDate || (project.publishedAt ? new Date(project.publishedAt).toLocaleDateString() : '--')}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-kentblue hover:text-kentblue/80 hover:bg-gray-100"
            asChild
          >
            <a href={project.url || `/projeler/${project.slug || project.id}` } className="flex items-center">
              Detaylar <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProjects;
