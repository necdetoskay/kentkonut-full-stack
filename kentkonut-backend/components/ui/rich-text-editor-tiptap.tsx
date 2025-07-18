'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { useCallback, useEffect, useState, useRef, useMemo, startTransition } from 'react';
import { ensureAbsoluteUrl } from '@/lib/url-utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// TipTap Universal Styles approach - use shared CSS for editor and frontend consistency
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { GlobalMediaSelector, GlobalMediaFile } from '@/components/media/GlobalMediaSelector';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,

  CodeXml, // Add CodeXml icon
} from 'lucide-react';



// FloatImage node using tiptap-universal-styles approach
const FloatImage = Node.create({
  name: 'floatImage',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      float: {
        default: 'none',
        parseHTML: element => element.getAttribute('data-float'),
        renderHTML: attributes => ({
          'data-float': attributes.float,
        }),
      },
      width: {
        default: '300px',
        parseHTML: element => element.style.width,
        renderHTML: attributes => ({
          style: `width: ${attributes.width}`,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[data-float]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const { float, width } = node.attrs;
    const floatValue = float || HTMLAttributes['data-float'];

    // Use TipTap Universal Styles approach - rely on CSS classes and data attributes
    return ['img', mergeAttributes(HTMLAttributes, {
      'data-float': floatValue,
      'data-width': width || '300px',
      style: `width: ${width || '300px'}; height: auto;`
    })]
  },

  addNodeView() {
    return ReactNodeViewRenderer(FloatImageNodeView)
  },
});

// FloatImage node view component with inline controls
const FloatImageNodeView = ({ node, updateAttributes, selected }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside handler to close editing controls
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as HTMLElement)) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing]);

  const handleFloatChange = (float: string) => {
    updateAttributes({ float });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="float-image-node-wrapper">
      <div
        ref={containerRef}
        className={`float-image-container ${node.attrs.float}`}
        style={{
          float: node.attrs.float !== 'none' ? node.attrs.float : 'none',
          width: node.attrs.width,
          margin: node.attrs.float === 'left' ? '0 20px 20px 0' :
                  node.attrs.float === 'right' ? '0 0 20px 20px' : '20px auto',
        }}
      >
        <img
          src={node.attrs.src}
          alt={node.attrs.alt}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            border: selected ? '2px solid #3b82f6' : 'none',
            borderRadius: '4px',
          }}
          onClick={() => setIsEditing(true)}
        />

        {(selected || isEditing) && (
          <div className="float-image-controls">
            <div className="float-controls">
              <button
                onClick={() => handleFloatChange('left')}
                className={`control-btn ${node.attrs.float === 'left' ? 'active' : ''}`}
              >
                ← Sol
              </button>
              <button
                onClick={() => handleFloatChange('none')}
                className={`control-btn ${node.attrs.float === 'none' ? 'active' : ''}`}
              >
                Orta
              </button>
              <button
                onClick={() => handleFloatChange('right')}
                className={`control-btn ${node.attrs.float === 'right' ? 'active' : ''}`}
              >
                Sağ →
              </button>
            </div>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  maxHeight?: string;
  disabled?: boolean;
  mediaFolder?: string; // Custom upload folder for images
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "İçerik yazın...",
  className = "",
  minHeight = "200px",
  maxHeight = "500px",
  disabled = false,
  mediaFolder = "default"
}: RichTextEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageAlign, setImageAlign] = useState('center');
  const [showHtml, setShowHtml] = useState(false); // State for HTML view

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      BulletList,
      OrderedList,
      ListItem,
      FloatImage,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false, // Fix SSR hydration warning
    onUpdate: ({ editor }) => {
      // Use startTransition for non-urgent onChange updates to prevent flushSync
      startTransition(() => {
        try {
          // Use standard TipTap HTML output - styling handled by CSS
          onChange(editor.getHTML());
        } catch (error) {
          console.warn('Editor onChange failed:', error);
        }
      });
    },
    editorProps: {
      attributes: {
        class: 'tiptap-render focus:outline-none',
      },
    },
  });

  // Advanced React 18 flushSync fix: Use startTransition for non-urgent updates
  const contentUpdateRef = useRef<string>(content);
  const isUpdatingContentRef = useRef(false);

  // Memoize content to prevent unnecessary updates
  const memoizedContent = useMemo(() => content, [content]);

  useEffect(() => {
    // Skip if content hasn't actually changed
    if (contentUpdateRef.current === content) {
      return;
    }

    if (editor && content !== editor.getHTML() && !isUpdatingContentRef.current) {
      isUpdatingContentRef.current = true;
      contentUpdateRef.current = content;

      // Use startTransition for non-urgent content updates
      startTransition(() => {
        // Use requestIdleCallback for better performance
        const updateContent = () => {
          if (editor && !editor.isDestroyed && content !== editor.getHTML()) {
            try {
              editor.commands.setContent(content);
            } catch (error) {
              console.warn('TipTap content update failed:', error);
            } finally {
              isUpdatingContentRef.current = false;
            }
          } else {
            isUpdatingContentRef.current = false;
          }
        };

        // Use requestIdleCallback if available, otherwise setTimeout
        if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
          window.requestIdleCallback(updateContent, { timeout: 100 });
        } else {
          setTimeout(updateContent, 0);
        }
      });
    }
  }, [memoizedContent, editor]);

  // Industry Standard: Let CSS handle consistency (no JavaScript enforcement needed)
  // This approach is used by Notion, Linear, and other modern editors
  const openImageDialog = useCallback(() => {
    console.log('🖼️ Opening image dialog, resetting state...');
    setImageUrl('');
    setImageAlt('');
    setImageAlign('center');
    setImageDialogOpen(true);
  }, []);

  const insertImage = useCallback(() => {
    if (imageUrl && editor) {
      // Convert alignment to float value for FloatImage
      let floatValue = 'none';
      if (imageAlign === 'float-left') {
        floatValue = 'left';
      } else if (imageAlign === 'float-right') {
        floatValue = 'right';
      }



      // Use fixed width for floating images to avoid height scaling issues
      const defaultWidth = imageAlign === 'center' ? '600px' : '300px';

      editor.chain().focus().insertContent({
        type: 'floatImage',
        attrs: {
          src: ensureAbsoluteUrl(imageUrl),
          alt: imageAlt || 'Eklenen resim',
          float: floatValue,
          width: defaultWidth,
        },
      }).run();

      setImageDialogOpen(false);
      setImageUrl('');
      setImageAlt('');
      setImageAlign('center');
    }
  }, [editor, imageUrl, imageAlt, imageAlign]);
  const handleMediaSelect = useCallback((media: GlobalMediaFile | null) => {
    console.log('🎯 RichTextEditor handleMediaSelect called:', media);
    if (media?.url) {
      console.log('✅ Setting image URL:', media.url);
      setImageUrl(media.url);
      setImageAlt(media.alt || media.filename || '');
    } else {
      console.log('❌ No media URL provided:', media);
    }
  }, []);



  const setLink = useCallback(() => {
    const previousUrl = editor?.getAttributes('link').href;
    const url = window.prompt('Link URL\'si girin:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
        {/* Toolbar */}
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
          {/* Text Formatting */}
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={disabled}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={disabled}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive('strike') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={disabled}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive('code') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
            disabled={disabled}
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings */}
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            disabled={disabled}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={disabled}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            disabled={disabled}
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={disabled}
          >
            <List className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={disabled}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive('blockquote') ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            disabled={disabled}
          >
            <Quote className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Alignment */}
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            disabled={disabled}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            disabled={disabled}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            disabled={disabled}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Media */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={setLink}
            disabled={disabled}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openImageDialog}
            disabled={disabled}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* View Source Button */}
          <Button
            type="button"
            variant={showHtml ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowHtml(!showHtml)}
            disabled={disabled}
            title="Kaynak Kodu Göster/Gizle"
          >
            <CodeXml className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Undo/Redo */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={disabled || !editor.can().chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={disabled || !editor.can().chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor */}
        <div
          className="tiptap-render p-4 focus-within:outline-none"
          style={{
            minHeight,
            maxHeight,
            overflowY: 'auto'
          }}
        >
          {showHtml ? (
            <textarea
              className="w-full h-full p-0 font-mono text-sm bg-white text-black rounded-none outline-none resize-none border-none focus:ring-0"
              style={{ minHeight }}
              value={editor.getHTML()}
              onChange={(e) => editor.commands.setContent(e.target.value)}
              disabled={disabled}
            />
          ) : (
            <EditorContent 
              editor={editor} 
              className="outline-none focus:outline-none min-h-full"
              placeholder={placeholder}
            />
          )}
        </div>
      </div>

      {/* Image Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resim Ekle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Media Selector */}
            <div>
              <Label>Medya Galerisinden Seç</Label>
              <div className="mt-2">
                <GlobalMediaSelector
                  onSelect={handleMediaSelect}
                  defaultCategory="content-images"
                  trigger={
                    <Button type="button" variant="outline" className="w-full">
                      {imageUrl ? "Görsel Seçildi" : "Görsel Seç"}
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Manual URL Input */}
            <div>
              <Label htmlFor="imageUrl">Veya Manuel URL Girin</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>

            {/* Alt Text */}
            <div>
              <Label htmlFor="imageAlt">Alt Metin (Opsiyonel)</Label>
              <Input
                id="imageAlt"
                placeholder="Resim açıklaması"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>

            {/* Alignment */}
            <div>
              <Label>Hizalama ve Konumlandırma</Label>
              <Select value={imageAlign} onValueChange={setImageAlign}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Merkez (Blok)</SelectItem>
                  <SelectItem value="left">Sol (Blok)</SelectItem>
                  <SelectItem value="right">Sağ (Blok)</SelectItem>
                  <SelectItem value="float-left">Sol Float (Text Sarması)</SelectItem>
                  <SelectItem value="float-right">Sağ Float (Text Sarması)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Size Controls */}
            <div className="space-y-3">
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-1">📏 Otomatik Boyutlandırma</p>
                <p>Resimler otomatik olarak uygun boyutlarda ayarlanır:</p>
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• <strong>Sol/Sağ Float:</strong> 300px genişlik, otomatik yükseklik</li>
                  <li>• <strong>Orta:</strong> 600px genişlik, otomatik yükseklik</li>
                  <li>• <strong>Yükseklik:</strong> Her zaman otomatik (orantılı)</li>
                </ul>
              </div>
            </div>

            {/* Preview */}
            {imageUrl && (
              <div className="border rounded-lg p-4">
                <Label className="text-sm text-gray-600">Önizleme:</Label>
                {imageAlign.startsWith('float-') ? (
                  <div className="mt-2 relative">
                    <div className={`tiptap-image-container tiptap-image-${imageAlign}`}>
                      <img
                        src={imageUrl}
                        alt={imageAlt}
                        className="max-w-full h-auto max-h-24 object-contain rounded"
                        style={{
                          width: imageAlign === 'center' ? '200px' : '120px',
                          height: 'auto'
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Bu bir örnek paragraftır. Floating resim seçildiğinde, text resmin etrafına bu şekilde sarılacaktır. 
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                    <div style={{ clear: 'both' }}></div>
                  </div>
                ) : (
                  <div className={`mt-2 tiptap-image-container tiptap-image-${imageAlign}`}>
                    <img
                      src={imageUrl}
                      alt={imageAlt}
                      className="max-w-full h-auto max-h-32 object-contain rounded"
                      style={{
                        width: imageAlign === 'center' ? '300px' : '150px',
                        height: 'auto',
                        marginLeft: imageAlign === 'left' ? '0' : imageAlign === 'center' ? 'auto' : 'auto',
                        marginRight: imageAlign === 'right' ? '0' : imageAlign === 'center' ? 'auto' : 'auto',
                        display: 'block'
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={insertImage} disabled={!imageUrl}>
              Resim Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Floating Image Styles */}
      <style jsx global>{`
        /* Float image container styles based on tiptap-universal-styles */
        .float-image-node-wrapper {
          position: relative;
        }

        .float-image-container {
          position: relative;
        }

        .float-image-container.left {
          float: left !important;
          margin: 0 20px 20px 0 !important;
          vertical-align: top !important;
          height: auto !important;
          border-radius: 4px !important;
          max-width: 100% !important;
        }

        .float-image-container.right {
          float: right !important;
          margin: 0 0 20px 20px !important;
          vertical-align: top !important;
          height: auto !important;
          border-radius: 4px !important;
          max-width: 100% !important;
        }

        .float-image-container.none {
          float: none !important;
          margin: 20px auto !important;
          display: block !important;
          height: auto !important;
          border-radius: 4px !important;
          max-width: 100% !important;
        }

        /* CRITICAL: Apply frontend-matching styles for floating images */
        .ProseMirror {
          line-height: 1.7 !important;
          overflow: visible !important; /* Allow text flow around floating images */
          width: 100% !important; /* Full width like frontend */
          max-width: none !important; /* Remove any width constraints */
        }

        /* Override Tailwind prose constraints to match frontend width */
        .prose.prose-sm.max-w-none .ProseMirror {
          max-width: none !important;
          width: 100% !important;
        }

        /* Ensure prose paragraphs don't have width constraints */
        .prose.prose-sm.max-w-none .ProseMirror p {
          max-width: none !important;
          width: auto !important;
        }

        /* Clearfix for ProseMirror container - match frontend behavior */
        .ProseMirror::after {
          content: "";
          display: table;
          clear: both;
        }

        /* CRITICAL: Paragraphs need to allow text flow around floating images */
        .ProseMirror p {
          margin: 0 0 16px 0 !important;
          overflow: visible !important; /* Allow text to flow around floating images */
          clear: none !important;
          line-height: 1.7 !important;
        }

        /* Empty paragraphs need min-height */
        .ProseMirror p:empty {
          min-height: 1.2em !important;
        }

        /* Editor paragraph styling to match frontend preview exactly */
        .ProseMirror .editor-paragraph {
          margin: 0 0 16px 0 !important;
          overflow: visible !important; /* Allow text flow like frontend */
          clear: none !important;
          line-height: 1.7 !important;
        }

        /* Apply tiptap-universal-styles floating image approach to editor */
        .ProseMirror img[data-float="left"] {
          float: left !important;
          margin: 0 20px 20px 0 !important;
          vertical-align: top !important;
          height: auto !important;
          border-radius: 4px !important;
          max-width: 100% !important;
        }

        .ProseMirror img[data-float="right"] {
          float: right !important;
          margin: 0 0 20px 20px !important;
          vertical-align: top !important;
          height: auto !important;
          border-radius: 4px !important;
          max-width: 100% !important;
        }

        .ProseMirror img[data-float="none"] {
          float: none !important;
          margin: 20px auto !important;
          display: block !important;
          height: auto !important;
          border-radius: 4px !important;
          max-width: 100% !important;
        }

        /* Additional rules to ensure floating works in editor like tiptap-universal-styles */
        .ProseMirror .float-image-container img {
          width: 100% !important;
          height: auto !important;
          display: block !important;
          border-radius: 4px !important;
        }

        /* Ensure headings clear floats like in tiptap-universal-styles */
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          clear: both !important;
        }

        /* Specific rules for our FloatImage node to work with existing CSS */
        .prose.prose-sm.max-w-none .ProseMirror .float-image-container.left + p,
        .prose.prose-sm.max-w-none .ProseMirror .float-image-container.right + p {
          margin-top: 0 !important;
          clear: none !important;
        }

        /* Ensure FloatImage containers don't clear floats */
        .prose.prose-sm.max-w-none .ProseMirror .float-image-container {
          clear: none !important;
        }

        /* Override any prose styles that might interfere */
        .prose.prose-sm .ProseMirror .float-image-container.left,
        .prose.prose-sm .ProseMirror .float-image-container.right {
          clear: none !important;
          margin-bottom: 20px !important;
        }

        .float-image-controls {
          position: absolute;
          top: -120px;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10;
          min-width: 250px;
          pointer-events: auto;
        }

        .float-controls {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
        }

        .control-btn {
          padding: 6px 12px;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: all 0.2s;
          flex: 1;
        }

        .control-btn:hover {
          background: #f3f4f6;
        }

        .control-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }


      `}</style>
    </>
  );
}
