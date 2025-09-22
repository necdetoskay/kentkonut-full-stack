import React, { useRef, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';
import { API_BASE_URL } from '../config/environment';

interface Project {
  id: number;
  name: string;
  location: string;
  year: string;
  blocks: number;
  units: number;
  image: string;
}

const CompletedProjects = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get('/api/projects?status=COMPLETED&limit=12');
        let projectsArray = [];
        if (Array.isArray(response.data)) {
          projectsArray = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          projectsArray = response.data.data;
        } else if (response.data && Array.isArray(response.data.projects)) {
          projectsArray = response.data.projects;
        } else {
          projectsArray = [];
        }
        const formattedProjects = projectsArray.map((project: any) => {
          const imageUrl = project.media?.url ? (project.media.url.startsWith('http') ? project.media.url : API_BASE_URL + project.media.url) : '/images/projelerimiz.png';

          return {
            id: project.id,
            name: project.title || project.name,
            location: [project.province, project.district].filter(Boolean).join(', ') || '-',
            year: project.publishedAt ? new Date(project.publishedAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }) : '-',
            blocks: project.blocks || 0,
            units: project.units || 0,
            image: imageUrl,
          };
        });
        setProjects(formattedProjects);
        setLoading(false);
      } catch (err) {
        setError("Projeler yüklenirken bir hata oluştu");
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  
  // 5 ve üzeri projede otomatik kaydırma kullan, daha azsa ortalanmış grid göster
  const useMarquee = projects.length >= 5;

  useEffect(() => {
    if (!useMarquee) return; // küçük listelerde otomatik kaydırmayı devre dışı bırak

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    let scrollPosition = 0;
    let isPaused = false;
    const scrollSpeed = 0.5;
    
    const scroll = () => {
      if (!scrollContainer || isPaused) return;
      
      scrollPosition += scrollSpeed;
      
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
    };
    
    const autoScroll = setInterval(scroll, 16);
    
    const handlePause = () => { isPaused = true; };
    const handleResume = () => { isPaused = false; };
    
    scrollContainer.addEventListener('mouseenter', handlePause);
    scrollContainer.addEventListener('mouseleave', handleResume);
    scrollContainer.addEventListener('touchstart', handlePause);
    scrollContainer.addEventListener('touchend', handleResume);
    
    return () => {
      clearInterval(autoScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handlePause);
        scrollContainer.removeEventListener('mouseleave', handleResume);
        scrollContainer.removeEventListener('touchstart', handlePause);
        scrollContainer.removeEventListener('touchend', handleResume);
      }
    };
  }, [projects, useMarquee]);
  
  if (loading) {
    return (
      <section className="py-8 bg-gray-100 w-full">
        <div className="w-full px-4 text-center">
          <div className="animate-pulse">Projeler yükleniyor...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-gray-100 w-full">
        <div className="w-full px-4 text-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

  if (!projects.length) {
    return (
      <section className="py-8 bg-gray-100 w-full">
        <div className="w-full px-4 text-center">
          Henüz tamamlanan proje bulunmuyor.
        </div>
      </section>
    );
  }
  
  // Kart bileşeni (hem marquee hem grid için ortak)
  const ProjectCard = ({ project }: { project: Project }) => (
    <div 
      className="inline-block w-64 whitespace-normal overflow-hidden group"
    >
      <div className="h-40 overflow-hidden relative shadow-md rounded-md">
        <img
          src={project.image}
          alt={project.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/projelerimiz.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 bg-white shadow-sm">
        <h3 className="text-sm font-bold text-kentblue leading-tight min-h-[40px]">{project.name}</h3>
        <div className="flex items-center text-xs text-gray-600 mt-2">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
          <span>{project.location}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600 mt-1">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
          </svg>
          <span>{project.year !== '-' ? project.year : '--'}</span>
        </div>
        <div className="flex items-center text-xs text-gray-600 mt-1">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"></path>
          </svg>
          <span>{project.blocks > 0 ? `${project.blocks} BLOK` : ''} {project.units} DAİRE</span>
        </div>
      </div>
    </div>
  );
  
  return (
    <section className="py-8 bg-gray-100 w-full">
      <div className="w-full px-4">
        <div className="flex justify-center items-center mb-8">
          <div className="inline-flex items-center gap-4">
            <div className="w-16 h-0.5 bg-green-500"></div>
            <h2 className="text-3xl font-bold text-gray-800">TAMAMLANAN PROJELERİMİZ</h2>
            <div className="w-16 h-0.5 bg-green-500"></div>
          </div>
        </div>
        
        <p className="text-center text-gray-600 mb-8 max-w-3xl mx-auto">
          Tamamladığımız ve anahtarını teslim ettiğimiz sıcak birer yuva haline gelen projelerimiz.
        </p>
        
        {/* Küçük listelerde ortalanmış grid */}
        {!useMarquee && (
          <div className="w-full flex justify-center">
            <div className="flex flex-wrap justify-center gap-6 max-w-5xl">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* 5+ projede otomatik yatay kaydırma */}
        {useMarquee && (
          <div 
            ref={scrollContainerRef}
            className="overflow-x-hidden relative w-full"
            style={{ scrollBehavior: 'smooth' }}
          >
            <div className="inline-flex gap-6 pl-4">
              {/* İlk grup */}
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
              
              {/* İkinci grup (sonsuz döngü etkisi için tekrarlanan projeler) */}
              {projects.map((project) => (
                <ProjectCard key={`clone-${project.id}`} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default CompletedProjects;