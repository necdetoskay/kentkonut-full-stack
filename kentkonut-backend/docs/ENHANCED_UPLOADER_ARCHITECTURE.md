# Enhanced Media Uploader - Component Architecture

## Analysis of Existing MediaUploader

### Current Implementation Insights
Based on the analysis of the existing MediaUploader component:

1. **Props Structure**: Uses `categoryId`, `defaultCategoryId`, `onUploadComplete`, `maxFiles`, `acceptedTypes`, `customFolder`
2. **State Management**: Manages files array with upload progress, status tracking, and preview URLs
3. **API Integration**: Uses `/api/media` endpoint with FormData including categoryId and customFolder
4. **File Handling**: Supports drag-and-drop, file validation, progress tracking, and blob URL cleanup
5. **Integration**: Used in MediaGallery component within a Dialog modal

### Current Usage Pattern
```typescript
// In MediaGallery.tsx
<MediaUploader
  categoryId={selectedCategory !== "all" ? parseInt(selectedCategory) : undefined}
  onUploadComplete={handleUploadComplete}
/>
```

## Enhanced Component Architecture

### 1. Main Component: EnhancedMediaUploader

```typescript
interface EnhancedMediaUploaderProps {
  // Compatibility with existing MediaUploader
  categoryId?: number;
  defaultCategoryId?: number;
  onUploadComplete?: (uploadedFiles: any[]) => void;
  onUploadStart?: () => void;
  maxFiles?: number;
  className?: string;
  acceptedTypes?: string[];
  customFolder?: string;
  
  // Enhanced features
  enableFolderSelection?: boolean;
  enableEmbeddedVideo?: boolean;
  enableMultiFormat?: boolean;
  showFileTypeSelector?: boolean;
  enableAdvancedPreview?: boolean;
  
  // UI customization
  title?: string;
  description?: string;
  layout?: 'compact' | 'expanded' | 'tabs';
  theme?: 'default' | 'minimal' | 'professional';
}
```

### 2. Subcomponent Structure

#### FolderSelector Component
```typescript
interface FolderSelectorProps {
  categories: MediaCategory[];
  selectedCategoryId: number | null;
  onCategoryChange: (categoryId: number) => void;
  enableCustomFolder?: boolean;
  customFolderValue?: string;
  onCustomFolderChange?: (folder: string) => void;
  disabled?: boolean;
}
```

**Features:**
- Dropdown with existing media categories
- Visual folder icons and descriptions
- Custom folder input option
- Category creation shortcut

#### FileTypeSelector Component
```typescript
interface FileTypeSelectorProps {
  activeType: 'files' | 'embedded';
  onTypeChange: (type: 'files' | 'embedded') => void;
  enabledTypes: {
    files: boolean;
    embedded: boolean;
  };
  fileTypeCounts: {
    images: number;
    documents: number;
    videos: number;
    embedded: number;
  };
}
```

**Features:**
- Tab-based file type selection
- Visual indicators for each type
- File count badges
- Type-specific upload areas

#### EnhancedFileUploadArea Component
```typescript
interface EnhancedFileUploadAreaProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes: string[];
  maxFiles: number;
  maxFileSize: number;
  isDragActive: boolean;
  isUploading: boolean;
  currentFileCount: number;
  supportedFormats: {
    images: string[];
    documents: string[];
    videos: string[];
  };
}
```

**Features:**
- Enhanced drag-and-drop zone
- Multi-format support indicators
- File size and count validation
- Visual feedback for different file types

#### EmbeddedVideoInput Component
```typescript
interface EmbeddedVideoInputProps {
  url: string;
  onUrlChange: (url: string) => void;
  onUrlSubmit: (videoData: EmbeddedVideoData) => void;
  isValidating: boolean;
  validationError?: string;
  supportedPlatforms: string[];
}

interface EmbeddedVideoData {
  url: string;
  platform: 'youtube' | 'vimeo';
  videoId: string;
  title?: string;
  thumbnail?: string;
  duration?: number;
  description?: string;
}
```

**Features:**
- URL input with real-time validation
- Platform detection (YouTube, Vimeo)
- Video metadata extraction
- Thumbnail preview
- Error handling for invalid URLs

#### EnhancedFilePreview Component
```typescript
interface EnhancedFilePreviewProps {
  files: EnhancedUploadFile[];
  onFileRemove: (fileId: string) => void;
  onFileEdit: (fileId: string) => void;
  onMetadataUpdate: (fileId: string, metadata: FileMetadata) => void;
  showMetadataEditor?: boolean;
  enableImageCropping?: boolean;
  layout: 'grid' | 'list';
}

interface EnhancedUploadFile extends UploadFile {
  fileType: 'image' | 'document' | 'video' | 'embedded';
  metadata?: FileMetadata;
  thumbnail?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

interface FileMetadata {
  alt?: string;
  caption?: string;
  tags?: string[];
  title?: string;
  description?: string;
}
```

**Features:**
- Enhanced file previews with thumbnails
- Metadata editing capabilities
- File type specific actions
- Progress indicators with detailed status
- Batch operations support

#### UploadProgressPanel Component
```typescript
interface UploadProgressPanelProps {
  files: EnhancedUploadFile[];
  overallProgress: number;
  isUploading: boolean;
  onPauseUpload?: () => void;
  onResumeUpload?: () => void;
  onCancelUpload: () => void;
  showDetailedProgress?: boolean;
}
```

**Features:**
- Overall upload progress
- Individual file progress
- Pause/resume functionality
- Error handling and retry options
- Upload speed and time estimates

### 3. State Management Architecture

```typescript
interface EnhancedUploaderState {
  // File management
  files: EnhancedUploadFile[];
  uploadQueue: string[];
  completedUploads: string[];
  failedUploads: string[];
  
  // UI state
  selectedCategory: MediaCategory | null;
  customFolder: string;
  activeFileType: 'files' | 'embedded';
  layout: 'grid' | 'list';
  
  // Upload state
  isUploading: boolean;
  isPaused: boolean;
  overallProgress: number;
  uploadSpeed: number;
  
  // Embedded video state
  embeddedVideoUrl: string;
  embeddedVideoData: EmbeddedVideoData | null;
  isValidatingVideo: boolean;
  
  // Error handling
  errors: UploadError[];
  validationErrors: ValidationError[];
  
  // Settings
  settings: {
    enableAutoUpload: boolean;
    enableImageCropping: boolean;
    enableMetadataEditor: boolean;
    maxConcurrentUploads: number;
  };
}
```

### 4. API Integration Architecture

#### Enhanced Upload Endpoint
```typescript
// POST /api/enhanced-media/upload
interface EnhancedUploadRequest {
  files: File[];
  categoryId: number;
  customFolder?: string;
  metadata?: FileMetadata[];
  settings?: {
    enableImageProcessing: boolean;
    targetWidth?: number;
    targetHeight?: number;
    quality?: number;
  };
}

interface EnhancedUploadResponse {
  success: boolean;
  data: UploadedFile[];
  errors?: UploadError[];
  processingJobs?: ProcessingJob[];
}
```

#### Embedded Video Endpoint
```typescript
// POST /api/enhanced-media/embedded-video
interface EmbeddedVideoRequest {
  url: string;
  categoryId: number;
  customFolder?: string;
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
  };
}

interface EmbeddedVideoResponse {
  success: boolean;
  data: EmbeddedVideoFile;
  videoData: EmbeddedVideoData;
}
```

#### Validation Endpoint
```typescript
// POST /api/enhanced-media/validate
interface ValidationRequest {
  files?: FileValidationData[];
  embeddedVideoUrl?: string;
  categoryId: number;
}

interface ValidationResponse {
  success: boolean;
  fileValidations?: FileValidationResult[];
  embeddedVideoValidation?: EmbeddedVideoValidationResult;
}
```

### 5. File Type Support Architecture

```typescript
const ENHANCED_FILE_SUPPORT = {
  images: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    maxSize: 10 * 1024 * 1024, // 10MB
    features: ['cropping', 'resizing', 'optimization', 'metadata']
  },
  documents: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
    mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 20 * 1024 * 1024, // 20MB
    features: ['preview', 'metadata', 'text-extraction']
  },
  videos: {
    extensions: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
    mimeTypes: ['video/mp4', 'video/avi', 'video/quicktime', 'video/webm'],
    maxSize: 100 * 1024 * 1024, // 100MB
    features: ['thumbnail-generation', 'compression', 'metadata']
  },
  embedded: {
    platforms: ['youtube.com', 'youtu.be', 'vimeo.com'],
    features: ['metadata-extraction', 'thumbnail-fetch', 'validation']
  }
};
```

### 6. Integration Strategy

#### Backward Compatibility
- Maintain all existing MediaUploader props
- Provide seamless drop-in replacement
- Preserve existing API contracts
- Support legacy callback patterns

#### Enhanced Integration Points
```typescript
// Enhanced MediaGallery integration
<EnhancedMediaUploader
  categoryId={selectedCategory !== "all" ? parseInt(selectedCategory) : undefined}
  onUploadComplete={handleUploadComplete}
  enableFolderSelection={true}
  enableEmbeddedVideo={true}
  enableMultiFormat={true}
  layout="expanded"
  theme="professional"
/>
```

### 7. Performance Considerations

#### Optimization Strategies
- Lazy loading for file previews
- Virtual scrolling for large file lists
- Chunked uploads for large files
- Background processing for thumbnails
- Efficient state updates with React.memo
- Debounced validation for embedded videos

#### Memory Management
- Automatic blob URL cleanup
- File object disposal after upload
- Preview image optimization
- Progress tracking optimization
- Component unmounting cleanup

This architecture provides a comprehensive foundation for implementing the enhanced media uploader while maintaining compatibility with existing systems and providing significant new capabilities.
