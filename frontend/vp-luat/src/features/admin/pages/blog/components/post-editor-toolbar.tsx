'use client';

import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Code2,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Unlink,
  Minus,
} from 'lucide-react';

interface ToolbarButtonProps {
  isActive?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ isActive, disabled, onClick, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={`pe-toolbar__btn${isActive ? ' pe-toolbar__btn--active' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="pe-toolbar__divider" aria-hidden="true" />;
}

interface PostEditorToolbarProps {
  editor: Editor | null;
  onUploadImage: (file: File) => Promise<void> | void;
  onAddImageByUrl: () => void;
}

export function PostEditorToolbar({
  editor,
  onUploadImage,
  onAddImageByUrl,
}: PostEditorToolbarProps) {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('URL', previousUrl ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' })
      .run();
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    void onUploadImage(file);
    event.target.value = '';
  };

  return (
    <div className="pe-toolbar" role="toolbar" aria-label="Định dạng văn bản">
      <ToolbarButton
        title="Bold (Ctrl+B)"
        isActive={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Italic (Ctrl+I)"
        isActive={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        isActive={editor.isActive('strike')}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        title="Heading 1"
        isActive={editor.isActive('heading', { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        isActive={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        isActive={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        title="Bullet list"
        isActive={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Ordered list"
        isActive={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Blockquote"
        isActive={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Code block"
        isActive={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code2 size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Inline code"
        isActive={editor.isActive('code')}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Horizontal rule"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus size={15} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        title="Link"
        isActive={editor.isActive('link')}
        onClick={setLink}
      >
        <LinkIcon size={15} />
      </ToolbarButton>
      {editor.isActive('link') && (
        <ToolbarButton title="Bỏ link" onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink size={15} />
        </ToolbarButton>
      )}
      <ToolbarButton title="Thêm ảnh từ URL" onClick={onAddImageByUrl}>
        <ImageIcon size={15} />
      </ToolbarButton>
      <label className="pe-toolbar__btn" title="Tải ảnh lên" aria-label="Tải ảnh lên">
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <span style={{ fontSize: 10, fontWeight: 700 }}>Upload</span>
      </label>

      <Divider />

      <ToolbarButton
        title="Undo (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo size={15} />
      </ToolbarButton>
      <ToolbarButton
        title="Redo (Ctrl+Y)"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo size={15} />
      </ToolbarButton>
    </div>
  );
}
