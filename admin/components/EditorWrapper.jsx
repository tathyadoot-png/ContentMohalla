"use client";

import { useEffect, useRef } from "react";

export default function EditorWrapper({ onChange, initialContent = null }) {
  const editorRef = useRef(null);
  const holderRef = useRef(null);
  const debounceRef = useRef(null);

  // Initialize EditorJS
  useEffect(() => {
    if (editorRef.current) return;

    let isMounted = true;

    async function initEditor() {
      if (!holderRef.current) return;

      const { default: EditorJS } = await import("@editorjs/editorjs");
      const { default: Header } = await import("@editorjs/header");
      const { default: Paragraph } = await import("@editorjs/paragraph");
      const { default: List } = await import("@editorjs/list");

      if (!isMounted) return;

      const editor = new EditorJS({
        holder: holderRef.current,
        autofocus: true,
        placeholder: "Start writing here...",
        async onChange() {
          clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(async () => {
            try {
              const savedData = await editor.saver.save();
              onChange?.(savedData);
            } catch (err) {
              console.error("Editor save error:",  err);
            }
          }, 400);
        },
        tools: {
          header: Header,
          paragraph: Paragraph,
          list: List,
        },
      });

      editorRef.current = editor;
    }

    initEditor();

    return () => {
      isMounted = false;
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      clearTimeout(debounceRef.current);
    };
  }, []);

  // Render new content after fetch
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current
        .render(initialContent)
        .catch((err) => console.error(err));
    }
  }, [initialContent]);
  return (
    <div
      ref={holderRef}
      className="border rounded p-4 bg-white min-h-[400px]"
    />
  );
}
