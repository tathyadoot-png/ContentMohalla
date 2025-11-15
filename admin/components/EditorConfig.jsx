"use client";

import { useEffect, useRef } from "react";

export default function EditorConfig({ onChange, data }) {
  const editorRef = useRef(null);       // EditorJS instance
  const containerRef = useRef(null);    // DOM holder

  useEffect(() => {
    let editor;

    async function loadEditor() {
      if (!containerRef.current || editorRef.current) return;

      const { default: EditorJS } = await import("@editorjs/editorjs");
      const { default: Header } = await import("@editorjs/header");
      const { default: Paragraph } = await import("@editorjs/paragraph");
      const { default: List } = await import("@editorjs/list");
      const { default: Checklist } = await import("@editorjs/checklist");
      const { default: Quote } = await import("@editorjs/quote");
      const { default: Code } = await import("@editorjs/code");
      const { default: InlineCode } = await import("@editorjs/inline-code");
      const { default: ImageTool } = await import("@editorjs/image");
      const { default: LinkTool } = await import("@editorjs/link");
      const { default: Table } = await import("@editorjs/table");
      const { default: Embed } = await import("@editorjs/embed");
      const { default: AlignmentTune } = await import("editorjs-text-alignment-blocktune");
      const { default: Marker } = await import("@editorjs/marker");

      // Safe Strikethrough import
      let Strikethrough;
      try {
        const module = await import("editorjs-strikethrough");
        Strikethrough = module.default || module;
      } catch (err) {
        console.warn("Strikethrough plugin not loaded:", err);
      }

      editor = new EditorJS({
        holder: containerRef.current, // 👈 attach to DOM node
        autofocus: true,
        data: data || {},
        placeholder: "Start writing here...",
        onChange: async () => {
          try {
            const saved = await editor.saver.save();
            onChange?.(saved);
          } catch (err) {
            console.error("Error saving EditorJS content:", err);
          }
        },
        tools: {
          header: Header,
          paragraph: {
            class: Paragraph,
            inlineToolbar: true,
            tunes: ["alignment"],
          },
          list: List,
          checklist: Checklist,
          quote: Quote,
          code: Code,
          inlineCode: InlineCode,
          image: ImageTool,
          embed: Embed,
          table: Table,
          linkTool: LinkTool,
          marker: Marker,
          alignment: {
            class: AlignmentTune,
            config: {
              default: "left",
              blocks: {
                header: "center",
                list: "left",
              },
            },
          },
          ...(Strikethrough ? { strikethrough: Strikethrough } : {}),
        },
      });

      editorRef.current = editor;
    }

    loadEditor();

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-[400px] border rounded p-4 bg-white"
    />
  );
}
