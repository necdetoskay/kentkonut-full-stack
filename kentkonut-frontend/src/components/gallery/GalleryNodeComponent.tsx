import React from 'react';
import { GalleryNode, ProjectGalleryItem } from '@/types/gallery';
import { ChevronDown, ChevronRight, Folder, Image as ImageIcon } from 'lucide-react';

interface GalleryNodeComponentProps {
  node: GalleryNode;
  expandedNodes: Set<number>;
  onToggle: (nodeId: number) => void;
  onImageClick: (index: number) => void;
  allImages: ProjectGalleryItem[];
}

const GalleryNodeComponent: React.FC<GalleryNodeComponentProps> = ({
  node,
  expandedNodes,
  onToggle,
  onImageClick,
  allImages
}) => {
  const isExpanded = expandedNodes.has(node.item.id);
  const hasChildren = node.children.length > 0;
  const isFolder = node.item.isFolder;
  const isLeafNode = !hasChildren && !isFolder;

  const handleClick = () => {
    if (isFolder || hasChildren) {
      onToggle(node.item.id);
    } else if (isLeafNode && node.item.media) {
      const imageIndex = allImages.findIndex(img => img.id === node.item.id);
      if (imageIndex !== -1) {
        onImageClick(imageIndex);
      }
    }
  };

  // Media URL helper function
  const getMediaUrl = (url?: string) => {
    if (!url) return '/images/placeholder.png';
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3021'}${url}`;
  };

  return (
    <div className={`gallery-node level-${node.level}`}>
      {/* Node Header */}
      <div 
        className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors border ${
          isFolder 
            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
            : isLeafNode
            ? 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
        }`}
        onClick={handleClick}
      >
        {/* Expand/Collapse Icon */}
        {(hasChildren || isFolder) && (
          <div className="mr-3">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </div>
        )}

        {/* Node Icon */}
        <div className="mr-3">
          {isFolder ? (
            <Folder className="w-5 h-5 text-blue-600" />
          ) : (
            <ImageIcon className="w-5 h-5 text-gray-500" />
          )}
        </div>

        {/* Node Content */}
        <div className="flex-1">
          <h3 className={`font-medium ${
            isFolder ? 'text-blue-900' : 'text-gray-900'
          }`}>
            {node.item.title}
          </h3>
          {node.item.description && (
            <p className="text-sm text-gray-600 mt-1">
              {node.item.description}
            </p>
          )}
        </div>

        {/* Item Count */}
        {hasChildren && (
          <div className="text-sm text-gray-500">
            {node.children.length} öğe
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6 mt-2 space-y-2">
          {node.children.map(childNode => (
            <GalleryNodeComponent
              key={childNode.item.id}
              node={childNode}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onImageClick={onImageClick}
              allImages={allImages}
            />
          ))}
        </div>
      )}

      {/* Leaf Node Image Preview */}
      {isLeafNode && node.item.media && (
        <div className="ml-8 mt-2">
          <div 
            className="relative w-40 h-32 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow border"
            onClick={handleClick}
          >
            <img
              src={getMediaUrl(node.item.media.url)}
              alt={node.item.media.alt || node.item.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.png';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryNodeComponent;
