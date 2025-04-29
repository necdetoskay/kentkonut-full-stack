"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { lowlight } from "lowlight";
import html from "lowlight/lib/languages/xml";
import css from "lowlight/lib/languages/css";
import js from "lowlight/lib/languages/javascript";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo,
  Redo,
  Code2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ToggleGroup,
  ToggleGroupItem
} from "@/components/ui/toggle-group";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

lowlight.registerLanguage("html", html);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("js", js);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder = "Açıklama ekleyin..." }: RichTextEditorProps) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlContent, setHtmlContent] = useState(value || "");
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        languageClassPrefix: "language-",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlContent(html);
      onChange(html);
    },
  });

  // HTML editörü değiştiğinde
  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const html = e.target.value;
    setHtmlContent(html);
    onChange(html);
  };

  // Mod değiştiğinde içeriği senkronize et
  useEffect(() => {
    if (!editor) return;
    
    if (!isHtmlMode) {
      editor.commands.setContent(htmlContent);
    }
  }, [isHtmlMode, htmlContent, editor]);

  // Değer dışarıdan değiştiğinde senkronize et
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value);
      setHtmlContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-md">
      <Tabs defaultValue="visual" onValueChange={(value) => setIsHtmlMode(value === "html")}>
        <div className="flex items-center justify-between p-2 border-b">
          <TabsList>
            <TabsTrigger value="visual">Görsel</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
          
          {!isHtmlMode && (
            <div className="flex items-center space-x-1">
              <ToggleGroup type="multiple">
                <ToggleGroupItem 
                  value="bold" 
                  aria-label="Kalın"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  data-state={editor.isActive('bold') ? 'on' : 'off'}
                >
                  <Bold className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="italic" 
                  aria-label="İtalik"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  data-state={editor.isActive('italic') ? 'on' : 'off'}
                >
                  <Italic className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="h1" 
                  aria-label="Başlık 1"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  data-state={editor.isActive('heading', { level: 1 }) ? 'on' : 'off'}
                >
                  <Heading1 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="h2" 
                  aria-label="Başlık 2"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  data-state={editor.isActive('heading', { level: 2 }) ? 'on' : 'off'}
                >
                  <Heading2 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="h3" 
                  aria-label="Başlık 3"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  data-state={editor.isActive('heading', { level: 3 }) ? 'on' : 'off'}
                >
                  <Heading3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="bulletList" 
                  aria-label="Madde İşaretli Liste"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  data-state={editor.isActive('bulletList') ? 'on' : 'off'}
                >
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="orderedList" 
                  aria-label="Numaralı Liste"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  data-state={editor.isActive('orderedList') ? 'on' : 'off'}
                >
                  <ListOrdered className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="blockquote" 
                  aria-label="Alıntı"
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  data-state={editor.isActive('blockquote') ? 'on' : 'off'}
                >
                  <Quote className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="codeBlock" 
                  aria-label="Kod Bloğu"
                  onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                  data-state={editor.isActive('codeBlock') ? 'on' : 'off'}
                >
                  <Code className="h-4 w-4" />
                </ToggleGroupItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Bağlantı</h4>
                        <p className="text-sm text-muted-foreground">
                          Metine bağlantı ekleyin.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="link">URL</Label>
                        <Input
                          id="link"
                          placeholder="https://example.com"
                          className="col-span-2 h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (editor.isActive('link')) {
                                editor.chain().focus().unsetLink().run();
                              } else {
                                const url = (e.currentTarget as HTMLInputElement).value;
                                if (url) {
                                  editor.chain().focus().setLink({ href: url }).run();
                                }
                              }
                              (e.currentTarget as HTMLInputElement).value = '';
                              document.body.click(); // close the popover
                            }
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Görsel</h4>
                        <p className="text-sm text-muted-foreground">
                          İçeriğe görsel ekleyin.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="image">URL</Label>
                        <Input
                          id="image"
                          placeholder="https://example.com/image.jpg"
                          className="col-span-2 h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const url = (e.currentTarget as HTMLInputElement).value;
                              if (url) {
                                editor.chain().focus().setImage({ src: url }).run();
                              }
                              (e.currentTarget as HTMLInputElement).value = '';
                              document.body.click(); // close the popover
                            }
                          }}
                        />
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </ToggleGroup>
              
              <div className="border-l pl-2 flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo()}
                  className="h-8 w-8"
                >
                  <Undo className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo()}
                  className="h-8 w-8"
                >
                  <Redo className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <TabsContent value="visual" className="p-0 m-0">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none p-4 focus:outline-none min-h-[200px] max-h-[500px] overflow-y-auto"
          />
          
          {editor && (
            <BubbleMenu 
              editor={editor} 
              tippyOptions={{ duration: 100 }}
              className="bg-background rounded border shadow p-1 flex items-center space-x-1"
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleBold().run()}
                data-active={editor.isActive('bold')}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                data-active={editor.isActive('italic')}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (editor.isActive('link')) {
                    editor.chain().focus().unsetLink().run();
                  } else {
                    const url = prompt('URL?');
                    if (url) {
                      editor.chain().focus().setLink({ href: url }).run();
                    }
                  }
                }}
                data-active={editor.isActive('link')}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => editor.chain().focus().toggleCode().run()}
                data-active={editor.isActive('code')}
              >
                <Code2 className="h-4 w-4" />
              </Button>
            </BubbleMenu>
          )}
        </TabsContent>
        
        <TabsContent value="html" className="p-0 m-0">
          <textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            className="w-full min-h-[200px] max-h-[500px] p-4 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="HTML kodunu düzenleyin..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RichTextEditor; 