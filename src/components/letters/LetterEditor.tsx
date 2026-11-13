import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import { Extension } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Search,
  Underline as UnderlineIcon,
  Undo2,
  Variable,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FIELD_META,
  SYSTEM_FIELDS,
  fieldLabel,
} from "./letterFields";

const FIELD_TOKEN_RE = /\{\{([A-Za-z0-9_]+)\}\}/g;

const FieldTokenHighlight = Extension.create({
  name: "fieldTokenHighlight",
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("fieldTokenHighlight"),
        props: {
          decorations(state) {
            const decorations: Decoration[] = [];
            state.doc.descendants((node, pos) => {
              if (!node.isText || !node.text) return;
              const text = node.text;
              FIELD_TOKEN_RE.lastIndex = 0;
              let match: RegExpExecArray | null;
              while ((match = FIELD_TOKEN_RE.exec(text)) !== null) {
                const from = pos + match.index;
                const to = from + match[0].length;
                decorations.push(
                  Decoration.inline(from, to, {
                    class: "letter-field-token",
                  })
                );
              }
            });
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

const BLOCKS: { id: string; label: string; description: string; html: string }[] = [
  {
    id: "heading",
    label: "Heading",
    description: "Section title",
    html: `<h2>Letter heading</h2><p></p>`,
  },
  {
    id: "paragraph",
    label: "Paragraph",
    description: "Blank paragraph",
    html: `<p></p>`,
  },
  {
    id: "greeting",
    label: "Greeting",
    description: "Dear employee…",
    html: `<p>Dear {{Employee_Name}},</p><p></p>`,
  },
  {
    id: "employee-details",
    label: "Employee details",
    description: "Name, ID, role, department",
    html: `<p><strong>Employee details</strong></p><ul><li>Name: {{Employee_Name}}</li><li>Employee ID: {{Employee_ID}}</li><li>Designation: {{Designation}}</li><li>Department: {{Department}}</li></ul><p></p>`,
  },
  {
    id: "salary-table",
    label: "Salary details",
    description: "Old → new CTC",
    html: `<p><strong>Compensation summary</strong></p><ul><li>Current CTC: {{Old_CTC}}</li><li>Revised CTC: {{New_CTC}}</li><li>Increment: {{Increment_Percent}}%</li><li>Effective date: {{Effective_Date}}</li></ul><p></p>`,
  },
  {
    id: "effective-date",
    label: "Effective date",
    description: "When the change applies",
    html: `<p>This change is effective from <strong>{{Effective_Date}}</strong>.</p><p></p>`,
  },
  {
    id: "bullet-list",
    label: "Bullet list",
    description: "Unordered list",
    html: `<ul><li></li></ul>`,
  },
  {
    id: "numbered-list",
    label: "Numbered list",
    description: "Ordered list",
    html: `<ol><li></li></ol>`,
  },
  {
    id: "divider",
    label: "Divider",
    description: "Horizontal rule",
    html: `<hr /><p></p>`,
  },
  {
    id: "signature",
    label: "Signature",
    description: "HR / manager sign-off",
    html: `<p></p><p>For the organization,</p><p></p><p>________________________</p><p>{{Manager_Name}}</p><p>Human Resources</p>`,
  },
  {
    id: "closing",
    label: "Closing",
    description: "Regards + manager",
    html: `<p></p><p>Regards,</p><p>{{Manager_Name}}</p>`,
  },
  {
    id: "company-footer",
    label: "Company footer",
    description: "Confidentiality line",
    html: `<p></p><p><em>This letter is confidential and intended solely for the named recipient.</em></p>`,
  },
  {
    id: "custom-text",
    label: "Custom text",
    description: "Editable paragraph",
    html: `<p>Type your text here.</p><p></p>`,
  },
];

type MenuKind = "field" | "block" | null;

type Props = {
  contentJson: any | null;
  onChange: (json: any) => void;
  editable?: boolean;
  className?: string;
  placeholder?: string;
  showToolbar?: boolean;
  onWriteWithAi?: () => void;
  toolbarExtra?: ReactNode;
  onEditorReady?: (editor: Editor | null) => void;
};

function SearchMenu({
  open,
  onClose,
  title,
  query,
  onQuery,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  query: string;
  onQuery: (q: string) => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-40 mt-1 w-[min(100vw-2rem,320px)] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
      role="listbox"
    >
      <div className="border-b border-border px-3 py-2">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search…"
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>
      <div className="max-h-64 overflow-y-auto py-1">{children}</div>
    </div>
  );
}

export function LetterEditor({
  contentJson,
  onChange,
  editable = true,
  className,
  placeholder = "Start writing your letter or paste your existing content here…",
  showToolbar = true,
  onWriteWithAi,
  toolbarExtra,
  onEditorReady,
}: Props) {
  const [menu, setMenu] = useState<MenuKind>(null);
  const [query, setQuery] = useState("");
  const [customField, setCustomField] = useState("");
  const [isEmpty, setIsEmpty] = useState(true);
  const [, setToolbarTick] = useState(0);
  const skipNextEmit = useRef(false);

  const extensions = useMemo(
    () => [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FieldTokenHighlight,
    ],
    []
  );

  const editor = useEditor({
    extensions,
    content: contentJson || { type: "doc", content: [{ type: "paragraph" }] },
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: ed }) => {
      setIsEmpty(ed.isEmpty);
      if (skipNextEmit.current) {
        skipNextEmit.current = false;
        return;
      }
      onChange(ed.getJSON());
    },
    editorProps: {
      attributes: {
        class: cn(
          "letter-prose prose prose-sm max-w-none min-h-[640px] px-10 py-12 sm:px-14 focus:outline-none",
          "prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2"
        ),
      },
    },
  });

  useEffect(() => {
    onEditorReady?.(editor ?? null);
    return () => onEditorReady?.(null);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) return;
    const bump = () => setToolbarTick((n) => n + 1);
    editor.on("transaction", bump);
    editor.on("selectionUpdate", bump);
    return () => {
      editor.off("transaction", bump);
      editor.off("selectionUpdate", bump);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    if (!editor || contentJson == null) return;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(contentJson);
    if (current === next) return;
    skipNextEmit.current = true;
    editor.commands.setContent(contentJson, { emitUpdate: false });
    setIsEmpty(editor.isEmpty);
  }, [editor, contentJson]);

  const insertField = (field: string) => {
    if (!editor) return;
    const token = field.replace(/[{}\s]/g, "").replace(/[^A-Za-z0-9_]/g, "_");
    if (!token) return;
    editor.chain().focus().insertContent(`{{${token}}}`).run();
    setMenu(null);
    setQuery("");
    setCustomField("");
  };

  const insertBlock = (html: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(html).run();
    setMenu(null);
    setQuery("");
  };

  const filteredFields = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SYSTEM_FIELDS.filter((f) => {
      if (!q) return true;
      const meta = FIELD_META[f];
      return (
        f.toLowerCase().includes(q) ||
        meta?.label.toLowerCase().includes(q) ||
        (meta?.description || "").toLowerCase().includes(q)
      );
    });
  }, [query]);

  const filteredBlocks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BLOCKS.filter((b) => {
      if (!q) return true;
      return (
        b.label.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.id.includes(q)
      );
    });
  }, [query]);

  const openMenu = (kind: MenuKind) => {
    setQuery("");
    setCustomField("");
    setMenu((m) => (m === kind ? null : kind));
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {showToolbar && editable && editor ? (
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-1 border-b border-border/80 bg-background/95 px-2 py-1.5 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant={menu === "field" ? "secondary" : "ghost"}
              className="h-8 gap-1.5 px-2.5 text-xs font-medium"
              onClick={() => openMenu("field")}
            >
              <Variable className="size-3.5" />
              Insert Field
            </Button>
            <SearchMenu
              open={menu === "field"}
              onClose={() => setMenu(null)}
              title="Insert field"
              query={query}
              onQuery={setQuery}
            >
              {filteredFields.length === 0 ? (
                <p className="px-3 py-3 text-center text-xs text-muted-foreground">No fields match</p>
              ) : (
                filteredFields.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-muted/80"
                    onClick={() => insertField(f)}
                  >
                    <span className="text-sm font-medium text-foreground">{fieldLabel(f)}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{`{{${f}}}`}</span>
                    {FIELD_META[f]?.description ? (
                      <span className="text-[11px] text-muted-foreground">{FIELD_META[f].description}</span>
                    ) : null}
                  </button>
                ))
              )}
              <div className="border-t border-border px-3 py-2">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Custom field
                </p>
                <div className="flex gap-1.5">
                  <Input
                    value={customField}
                    onChange={(e) => setCustomField(e.target.value)}
                    placeholder="e.g. Joining_Date"
                    className="h-8 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        insertField(customField);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 shrink-0"
                    disabled={!customField.trim()}
                    onClick={() => insertField(customField)}
                  >
                    Insert
                  </Button>
                </div>
              </div>
            </SearchMenu>
          </div>

          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant={menu === "block" ? "secondary" : "ghost"}
              className="h-8 gap-1.5 px-2.5 text-xs font-medium"
              onClick={() => openMenu("block")}
            >
              <LayoutTemplate className="size-3.5" />
              Insert Block
            </Button>
            <SearchMenu
              open={menu === "block"}
              onClose={() => setMenu(null)}
              title="Insert block"
              query={query}
              onQuery={setQuery}
            >
              {filteredBlocks.length === 0 ? (
                <p className="px-3 py-4 text-center text-xs text-muted-foreground">No blocks match</p>
              ) : (
                filteredBlocks.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left hover:bg-muted/80"
                    onClick={() => insertBlock(b.html)}
                  >
                    <span className="text-sm font-medium text-foreground">{b.label}</span>
                    <span className="text-[11px] text-muted-foreground">{b.description}</span>
                  </button>
                ))
              )}
            </SearchMenu>
          </div>

          {onWriteWithAi ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 gap-1.5 px-2.5 text-xs font-medium"
              onClick={onWriteWithAi}
            >
              <Sparkles className="size-3.5" />
              Write with AI
            </Button>
          ) : null}

          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            title="Undo"
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="size-8"
            title="Redo"
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo2 className="size-3.5" />
          </Button>

          <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden />

          <Button
            type="button"
            size="icon"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive("underline") ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive({ textAlign: "left" }) ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive({ textAlign: "center" }) ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant={editor.isActive({ textAlign: "right" }) ? "secondary" : "ghost"}
            className="size-8"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="size-3.5" />
          </Button>

          {toolbarExtra ? <div className="ml-auto flex items-center gap-1">{toolbarExtra}</div> : null}
        </div>
      ) : null}

      <div className="relative flex-1">
        {isEmpty && editable ? (
          <div
            className="pointer-events-none absolute left-10 top-12 z-10 max-w-[28rem] text-[15px] leading-relaxed text-muted-foreground/70 sm:left-14"
            aria-hidden
          >
            {placeholder}
          </div>
        ) : null}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
