
import { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { API_BASE_URL } from '../config/environment';

const backendBase = API_BASE_URL;

// Bu fonksiyon artık kullanılmıyor - ProjectsPage.tsx'teki mantığı kullanacağız

const FeaturedProjects = () => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [ongoingProjects, setOngoingProjects] = useState<any[]>([]);
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ongoingRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = 280; // card width (~30% smaller than before) + gap
  const scrollLeft = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) ref.current.scrollBy({ left: -scrollByAmount, behavior: 'smooth' });
  }, []);
  const scrollRight = useCallback((ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) ref.current.scrollBy({ left: scrollByAmount, behavior: 'smooth' });
  }, []);

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
              <div className="relative">
                {/* Arrows */}
                <button
                  type="button"
                  aria-label="Önceki"
                  className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
                  onClick={() => scrollLeft(ongoingRef)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Sonraki"
                  className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
                  onClick={() => scrollRight(ongoingRef)}
                >
                  ›
                </button>

                {/* Horizontal carousel */}
                <div ref={ongoingRef} className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar px-1"
                     style={{ scrollSnapType: 'x mandatory' }}>
                  {ongoingProjects.map((project) => (
                    <div key={project.id} className="flex-none w-[260px] sm:w-[280px] md:w-[300px] scroll-snap-align-start">
                      <ProjectCard project={project} compact />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-0">
            {loading ? (
              <div className="text-center py-8">Projeler yükleniyor...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">{error}</div>
            ) : (
              <div className="relative">
                {/* Arrows */}
                <button
                  type="button"
                  aria-label="Önceki"
                  className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
                  onClick={() => scrollLeft(completedRef)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Sonraki"
                  className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full shadow p-2"
                  onClick={() => scrollRight(completedRef)}
                >
                  ›
                </button>

                {/* Horizontal carousel */}
                <div ref={completedRef} className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar px-1"
                     style={{ scrollSnapType: 'x mandatory' }}>
                  {completedProjects.map((project) => (
                    <div key={project.id} className="flex-none w-[260px] sm:w-[280px] md:w-[300px] scroll-snap-align-start">
                      <ProjectCard project={project} compact />
                    </div>
                  ))}
                </div>
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
  compact?: boolean;
}

const statusLabelMap: Record<string, string> = {
  ONGOING: 'Devam Ediyor',
  COMPLETED: 'Tamamlandı',
};

const ProjectCard = ({ project, compact = false }: ProjectCardProps) => {
  // ProjectsPage.tsx'teki ile aynı mantığı kullan
  const backendBase = API_BASE_URL;
  let imageUrl = project.image || (project.media?.url
    ? (project.media.url.startsWith('http')
        ? project.media.url
        : API_BASE_URL + project.media.url)
    : '/projects/default.jpg');

  const statusRaw = project.status || project.statusLabel;
  const statusLabel = statusLabelMap[statusRaw] || statusRaw || '';
  const imgHeight = compact ? 'h-32 sm:h-36' : 'h-40 sm:h-52';
  const titleClass = compact ? 'text-base md:text-lg' : 'text-lg md:text-xl';
  const textSm = compact ? 'text-[11px] md:text-xs' : 'text-xs md:text-sm';
  const padClass = compact ? 'p-3 sm:p-3' : 'p-4 sm:p-5';

  return (
    <div className={`group bg-white rounded-lg overflow-hidden shadow-md motion-safe:hover:shadow-2xl motion-safe:hover:-translate-y-1 motion-safe:transition-all motion-safe:duration-300 motion-safe:ease ${padClass}`}>
      <div className={`relative w-full ${imgHeight} overflow-hidden`}>
        <img 
          src={imageUrl}
          alt={project.title || project.name} 
          className="w-full h-full object-cover motion-safe:hover:scale-105 motion-safe:transition-transform motion-safe:duration-500"
          loading="lazy"
        />
        {/* Hover overlay summary */}
        {(project.summary || project.description) && (
          <div className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-3 text-xs leading-snug">
            <div className="line-clamp-5">{project.summary || project.description}</div>
          </div>
        )}
        <div className="absolute top-0 right-0 bg-kentgold text-black font-medium text-sm py-1 px-3">
          {statusLabel}
        </div>
      </div>
      <div className={compact ? 'p-3' : 'p-5'}>
        <h3 className={`${titleClass} font-bold mb-2 text-kentblue truncate`}>{project.title || project.name}</h3>
        <p className={`${textSm} text-gray-500 mb-3 truncate`}>{project.locationName || project.location || ''}</p>
        {/* Summary removed from normal state; appears on hover overlay */}
        <div className={`flex items-center justify-between ${compact ? 'mt-2' : 'mt-3 sm:mt-5'}`}>
          <span className={compact ? 'text-xs text-gray-500' : 'text-sm text-gray-500'}>
            <strong>Teslim:</strong> {project.completionDate || (project.publishedAt ? new Date(project.publishedAt).toLocaleDateString() : '--')}
          </span>
          <Button 
            variant="ghost" 
            size={compact ? 'sm' : 'sm'} 
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
}
;

export default FeaturedProjects;
