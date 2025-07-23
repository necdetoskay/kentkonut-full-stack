# Enhanced Media Uploader - Technical Specification

## Overview

This document outlines the technical specification for creating an enhanced media uploader component for the Media Management page. The new uploader will provide advanced features while preserving the original MediaUploader component.

## Requirements Analysis

### Core Requirements
1. **Preserve Original**: Keep existing MediaUploader component intact
2. **Enhanced Features**: Create new uploader with advanced capabilities
3. **Folder Selection**: Dropdown for choosing upload destination
4. **Multi-Format Support**: Images, PDF, Word, videos, embedded videos
5. **Integration**: Replace upload form in Media Management page

### Technical Requirements
- React + TypeScript implementation
- Responsive design and accessibility
- API compatibility with existing endpoints
- Error handling and validation
- Progress indicators and file previews

## Component Architecture

### Main Component: EnhancedMediaUploader
```typescript
interface EnhancedMediaUploaderProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onUploadStart?: () => void;
  onUploadProgress?: (progress: number) => void;
  maxFiles?: number;
  maxFileSize?: number;
  allowedTypes?: string[];
  defaultFolder?: string;
  showFolderSelector?: boolean;
  enableEmbeddedVideo?: boolean;
  className?: string;
}
```

### Subcomponents Structure

#### 1. FolderSelector
- Dropdown for selecting upload destination
- Fetches existing media categories
- Supports custom folder creation
- Visual folder icons and descriptions

#### 2. FileTypeSelector
- Tabs or buttons for different file types
- Visual indicators for supported formats
- Type-specific upload areas

#### 3. FileUploadArea
- Drag and drop zone
- File browser integration
- Multiple file selection
- File type validation

#### 4. EmbeddedVideoInput
- URL input for YouTube/Vimeo
- URL validation and preview
- Thumbnail extraction
- Metadata fetching

#### 5. FilePreviewGrid
- Thumbnail previews for uploaded files
- Progress indicators during upload
- File information display
- Remove/retry actions

#### 6. UploadProgress
- Overall upload progress
- Individual file progress
- Error states and retry options
- Success confirmation

## File Type Support

### Supported Formats
```typescript
const SUPPORTED_FILE_TYPES = {
  images: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  documents: ['.pdf', '.doc', '.docx', '.txt'],
  videos: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm'],
  embedded: ['youtube.com', 'youtu.be', 'vimeo.com']
};
```

### File Validation Rules
- **Images**: Max 10MB, standard web formats
- **Documents**: Max 20MB, PDF and Word formats
- **Videos**: Max 100MB, common video formats
- **Embedded**: Valid YouTube/Vimeo URLs

## Folder/Category System

### Existing Categories Integration
```typescript
interface MediaCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  path: string;
}
```

### Default Folders
- Haberler (News) - `/media/haberler`
- Projeler (Projects) - `/media/projeler`
- Kurumsal (Corporate) - `/media/kurumsal`
- Banner - `/media/banner`
- Sayfa (Pages) - `/media/sayfa`
- Genel (General) - `/media/genel`

## API Integration

### Upload Endpoints
- **File Upload**: `POST /api/enhanced-media/upload`
- **Embedded Video**: `POST /api/enhanced-media/embedded`
- **Categories**: `GET /api/media-categories`
- **Validation**: `POST /api/enhanced-media/validate`

### Request/Response Format
```typescript
// Upload Request
interface UploadRequest {
  files: File[];
  categoryId: number;
  customFolder?: string;
  metadata?: {
    alt?: string;
    caption?: string;
    tags?: string[];
  };
}

// Upload Response
interface UploadResponse {
  success: boolean;
  data: UploadedFile[];
  errors?: UploadError[];
}

// Embedded Video Request
interface EmbeddedVideoRequest {
  url: string;
  categoryId: number;
  title?: string;
  description?: string;
}
```

## State Management

### Component State Structure
```typescript
interface EnhancedUploaderState {
  // File management
  selectedFiles: File[];
  uploadedFiles: UploadedFile[];
  uploadProgress: { [fileId: string]: number };
  
  // UI state
  selectedFolder: MediaCategory | null;
  activeTab: 'files' | 'embedded';
  isDragOver: boolean;
  isUploading: boolean;
  
  // Embedded video
  embeddedVideoUrl: string;
  embeddedVideoData: EmbeddedVideoData | null;
  
  // Error handling
  errors: UploadError[];
  validationErrors: ValidationError[];
}
```

## UI/UX Design Specifications

### Layout Structure
1. **Header Section**
   - Folder selector dropdown
   - File type tabs (Files / Embedded Video)
   - Upload statistics

2. **Main Upload Area**
   - Drag and drop zone
   - File browser button
   - Embedded video URL input (when active)

3. **Preview Section**
   - File thumbnails grid
   - Progress indicators
   - File actions (remove, retry)

4. **Footer Section**
   - Upload button
   - Cancel button
   - Overall progress bar

### Visual Design Elements
- **Colors**: Primary blue, success green, error red
- **Icons**: Folder, file type, upload, progress icons
- **Animations**: Smooth transitions, loading spinners
- **Responsive**: Mobile-first design approach

## Integration Points

### Media Management Page Integration
- Replace existing upload modal
- Maintain existing trigger buttons
- Preserve callback functions
- Ensure seamless user experience

### Compatibility Requirements
- Work with existing deletion functionality
- Support auto-selection features
- Maintain visual feedback (NEW badges)
- Compatible with gallery refresh

## Error Handling Strategy

### Validation Errors
- File size limits
- File type restrictions
- Invalid embedded video URLs
- Network connectivity issues

### User Feedback
- Toast notifications for errors/success
- Inline validation messages
- Progress indicators with error states
- Retry mechanisms for failed uploads

## Performance Considerations

### Optimization Strategies
- Lazy loading for large file previews
- Chunked uploads for large files
- Debounced URL validation
- Efficient state updates

### Memory Management
- File object cleanup after upload
- Preview image optimization
- Progress tracking optimization
- Component unmounting cleanup

## Accessibility Features

### WCAG Compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management

### Accessibility Implementation
- ARIA labels and descriptions
- Semantic HTML structure
- Keyboard shortcuts
- Alternative text for images

## Testing Strategy

### Unit Tests
- Component rendering
- File validation logic
- State management
- API integration

### Integration Tests
- Upload workflow end-to-end
- Folder selection functionality
- Embedded video processing
- Error handling scenarios

### User Experience Tests
- Drag and drop functionality
- Mobile responsiveness
- Accessibility compliance
- Performance benchmarks

## Implementation Phases

### Phase 1: Core Structure
- Create main component shell
- Implement folder selector
- Basic file upload functionality

### Phase 2: Enhanced Features
- Multi-format file support
- Embedded video functionality
- File preview system

### Phase 3: UI/UX Polish
- Responsive design implementation
- Accessibility improvements
- Animation and transitions

### Phase 4: Integration & Testing
- Media Management page integration
- Comprehensive testing
- Documentation and demos

## Success Criteria

### Functional Requirements
- ✅ All file types upload successfully
- ✅ Folder selection works correctly
- ✅ Embedded videos process properly
- ✅ Error handling is robust

### Performance Requirements
- ✅ Upload speed comparable to original
- ✅ UI remains responsive during uploads
- ✅ Memory usage stays within limits
- ✅ Mobile performance is acceptable

### User Experience Requirements
- ✅ Intuitive and easy to use
- ✅ Clear feedback and progress indication
- ✅ Accessible to all users
- ✅ Consistent with existing design

This specification provides the foundation for implementing a comprehensive enhanced media uploader that meets all requirements while maintaining compatibility with existing systems.
