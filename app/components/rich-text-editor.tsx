"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichTextEditor({ value, onChange, placeholder = "İçerik ekleyin...", disabled = false }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Link,
      Image,
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "min-h-[200px] max-h-[500px] overflow-y-auto border rounded-md p-3 focus:outline-none",
        placeholder: placeholder,
      },
    },
  });

  const lastValue = useRef(value);

  useEffect(() => {
    if (editor && value !== lastValue.current && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
      lastValue.current = value;
    }
  }, [value, editor]);

  if (!editor) return <div className="h-32 border rounded bg-muted/20 animate-pulse" />;

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2 flex-wrap">
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBold().run()} data-active={editor.isActive('bold')}><b>B</b></Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleItalic().run()} data-active={editor.isActive('italic')}><i>I</i></Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleUnderline().run()} data-active={editor.isActive('underline')}>U</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleStrike().run()} data-active={editor.isActive('strike')}>S</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} data-active={editor.isActive('heading', { level: 1 })}>H1</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} data-active={editor.isActive('heading', { level: 2 })}>H2</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} data-active={editor.isActive('heading', { level: 3 })}>H3</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBulletList().run()} data-active={editor.isActive('bulletList')}>• List</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleOrderedList().run()} data-active={editor.isActive('orderedList')}>1. List</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleBlockquote().run()} data-active={editor.isActive('blockquote')}>❝</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().toggleCode().run()} data-active={editor.isActive('code')}>{"</>"}</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => {
          const url = prompt("Bağlantı (URL) girin:", "https://");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}>🔗</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => {
          const url = prompt("Resim URL'si girin:", "https://");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}>🖼️</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().undo().run()}>↺</Button>
        <Button type="button" size="sm" variant="outline" onClick={() => editor.chain().focus().redo().run()}>↻</Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
} 