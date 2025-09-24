import React, { useState, useMemo } from 'react';
import { ProjectGalleryItem, GalleryNode, ProjectGalleryCategory, getCategoryLabel } from '@/types/gallery';
import GalleryNodeComponent from './GalleryNodeComponent';
import LightboxModal from './LightboxModal';
import './gallery.css';

interface HierarchicalGalleryProps {
  galleryItems: ProjectGalleryItem[];
  projectTitle: string;
}

const HierarchicalGallery: React.FC<HierarchicalGalleryProps> = ({
  galleryItems,
  projectTitle
}) => {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectGalleryCategory | 'all'>('all');

  // Hierarchical yapıyı oluştur
  const galleryTree = useMemo(() => {
    return buildGalleryTree(galleryItems);
  }, [galleryItems]);

  // Filtrelenmiş galeri ağacı
  const filteredTree = useMemo(() => {
    if (selectedCategory === 'all') return galleryTree;
    return filterTreeByCategory(galleryTree, selectedCategory);
  }, [galleryTree, selectedCategory]);

  // Tree building function
  const buildGalleryTree = (items: ProjectGalleryItem[]): GalleryNode[] => {
    const itemMap = new Map<number, ProjectGalleryItem>();
    const rootNodes: GalleryNode[] = [];

    // Tüm item'ları map'e ekle
    items.forEach(item => {
      itemMap.set(item.id, item);
    });

    // Parent-child ilişkilerini kur
    items.forEach(item => {
      const node: GalleryNode = {
        item,
        children: [],
        level: 0
      };

      if (item.parentId && itemMap.has(item.parentId)) {
        // Child node - parent'ı bul ve ekle
        const parentNode = findNodeById(rootNodes, item.parentId);
        if (parentNode) {
          node.level = parentNode.level + 1;
          parentNode.children.push(node);
        }
      } else {
        // Root node
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  // Node'u ID ile bul
  const findNodeById = (nodes: GalleryNode[], id: number): GalleryNode | null => {
    for (const node of nodes) {
      if (node.item.id === id) return node;
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
    return null;
  };

  // Kategoriye göre filtrele
  const filterTreeByCategory = (nodes: GalleryNode[], category: ProjectGalleryCategory): GalleryNode[] => {
    return nodes.filter(node => {
      if (node.item.category === category) return true;
      const filteredChildren = filterTreeByCategory(node.children, category);
      if (filteredChildren.length > 0) {
        node.children = filteredChildren;
        return true;
      }
      return false;
    });
  };

  // Node'u genişlet/daralt
  const toggleNode = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Tüm görselleri düz liste olarak al (lightbox için)
  const getAllImages = (nodes: GalleryNode[]): ProjectGalleryItem[] => {
    const images: ProjectGalleryItem[] = [];
    nodes.forEach(node => {
      // Sadece görsel olan item'ları ekle (isFolder=false ve media var)
      if (!node.item.isFolder && node.item.media) {
        images.push(node.item);
      }
      images.push(...getAllImages(node.children));
    });
    return images;
  };

  const allImages = getAllImages(filteredTree);

  // Mevcut kategorileri al
  const availableCategories = useMemo(() => {
    const categories = new Set<ProjectGalleryCategory>();
    galleryItems.forEach(item => {
      categories.add(item.category);
    });
    return Array.from(categories);
  }, [galleryItems]);

  return (
    <div className="gallery-container">
      {/* Kategori Filtreleri */}
      <div className="gallery-filters mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-kentblue text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tümü
          </button>
          {availableCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-kentblue text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>
      </div>

      {/* Hierarchical Gallery Tree */}
      <div className="gallery-tree space-y-2">
        {filteredTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Bu kategoride galeri öğesi bulunamadı.</p>
          </div>
        ) : (
          filteredTree.map(node => (
            <GalleryNodeComponent
              key={node.item.id}
              node={node}
              expandedNodes={expandedNodes}
              onToggle={toggleNode}
              onImageClick={(index) => {
                setCurrentImageIndex(index);
                setLightboxOpen(true);
              }}
              allImages={allImages}
            />
          ))
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <LightboxModal
          images={allImages}
          currentIndex={currentImageIndex}
          onClose={() => setLightboxOpen(false)}
          onNavigate={setCurrentImageIndex}
        />
      )}
    </div>
  );
};

export default HierarchicalGallery;
