import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
// CHANGE: Import as named exports, not default
import { Table, TableRow, TableCell,TableHeader } from "@tiptap/extension-table";
import {
  Box,
  Paper,
  Button,
  Stack,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  Code,
  FormatListBulleted,
  FormatListNumbered,
  Title,
  Link as LinkIcon,
  TableChart,
  Undo,
  Redo,
  FormatClear,
} from "@mui/icons-material";

const RichTextEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
        handleWidth: 4,
        cellMinWidth: 100,
        lastColumnResizable: true,
        collapseTable: false,
      }),
      TableRow,
      TableCell,
      TableHeader
    ],
    content: value || "<p>Start typing...</p>",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = prompt("Enter the URL:");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
  };

  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  return (
    <Paper sx={{ border: "1px solid #ddd", borderRadius: 1 }}>
      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
          p: 2,
          borderBottom: "1px solid #ddd",
          backgroundColor: "#fafafa",
        }}
      >
        {/* Text Formatting */}
        <Tooltip title="Bold">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBold().run()}
            sx={{
              backgroundColor: editor.isActive("bold") ? "#e3f2fd" : "transparent",
            }}
          >
            <FormatBold fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Italic">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            sx={{
              backgroundColor: editor.isActive("italic") ? "#e3f2fd" : "transparent",
            }}
          >
            <FormatItalic fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Underline">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            sx={{
              backgroundColor: editor.isActive("underline") ? "#e3f2fd" : "transparent",
            }}
          >
            <FormatUnderlined fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Code">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleCode().run()}
            sx={{
              backgroundColor: editor.isActive("code") ? "#e3f2fd" : "transparent",
            }}
          >
            <Code fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Headings */}
        <Tooltip title="Heading 1">
          <IconButton
            size="small"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            sx={{
              backgroundColor: editor.isActive("heading", { level: 1 })
                ? "#e3f2fd"
                : "transparent",
            }}
          >
            <Title fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Heading 2">
          <Button
            size="small"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            sx={{
              minWidth: "auto",
              p: 0.5,
              backgroundColor: editor.isActive("heading", { level: 2 })
                ? "#e3f2fd"
                : "transparent",
            }}
          >
            H2
          </Button>
        </Tooltip>

        <Tooltip title="Heading 3">
          <Button
            size="small"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            sx={{
              minWidth: "auto",
              p: 0.5,
              backgroundColor: editor.isActive("heading", { level: 3 })
                ? "#e3f2fd"
                : "transparent",
            }}
          >
            H3
          </Button>
        </Tooltip>

        <Divider orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Lists */}
        <Tooltip title="Bullet List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            sx={{
              backgroundColor: editor.isActive("bulletList") ? "#e3f2fd" : "transparent",
            }}
          >
            <FormatListBulleted fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Ordered List">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            sx={{
              backgroundColor: editor.isActive("orderedList") ? "#e3f2fd" : "transparent",
            }}
          >
            <FormatListNumbered fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Links & Tables */}
        <Tooltip title="Add Link">
          <IconButton size="small" onClick={addLink}>
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Insert Table">
          <IconButton size="small" onClick={insertTable}>
            <TableChart fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider orientation="vertical" sx={{ mx: 0.5 }} />

        {/* Undo/Redo */}
        <Tooltip title="Undo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Redo">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Clear Formatting">
          <IconButton
            size="small"
            onClick={() => editor.chain().focus().clearNodes().run()}
          >
            <FormatClear fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        style={{
          minHeight: "300px",
          padding: "16px",
          fontSize: "1.1rem",
          lineHeight: 1.8,
        }}
      />

      {/* Editor Styles */}
      <style>{`
        .ProseMirror {
          outline: none;
        }

        .ProseMirror h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem;
          color: #4a148c;
        }

        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 1.25rem 0 0.75rem;
          color: #4a148c;
        }

        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
          color: #4a148c;
        }

        .ProseMirror p {
          margin-bottom: 1rem;
        }

        .ProseMirror code {
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }

        .ProseMirror pre {
          background-color: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          margin-bottom: 1rem;
        }

        .ProseMirror pre code {
          background-color: transparent;
          padding: 0;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .ProseMirror table {
          border-collapse: collapse;
          margin: 1rem 0;
          width: 100%;
        }

        .ProseMirror table td,
        .ProseMirror table th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }

        .ProseMirror table th {
          background-color: #f5f5f5;
          font-weight: 600;
        }

        .ProseMirror a {
          color: #ab47bc;
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #ab47bc;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #666;
        }
      `}</style>
    </Paper>
  );
};

export default RichTextEditor;
