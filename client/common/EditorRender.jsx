'use client'

import React, { memo } from 'react'

function EditorRenderComponent({ content }) {
  let parsed = content

  // 🔥 if it's a string, parse it
  if (typeof content === 'string') {
    try {
      parsed = JSON.parse(content)
    } catch {
      return <p>Invalid content</p>
    }
  }
  if (!parsed || !parsed.blocks) return <p>No content to display</p>

  return (
    <div className="prose space-y-4">
      {parsed.blocks.map((block, idx) => {
        const style = {
          color: block.data?.color || undefined,
          backgroundColor: block.data?.background || undefined,
        }

        switch (block.type) {
          // 📌 Text blocks
          case 'paragraph':
          case 'header':
          case 'quote':
          case 'marker':
          case 'strikethrough': {
            const Tag =
              block.type === 'header'
                ? `h${block.data.level}`
                : block.type === 'quote'
                ? 'blockquote'
                : block.type === 'marker'
                ? 'mark'
                : block.type === 'strikethrough'
                ? 's'
                : 'p'

            return (
              <Tag
                key={idx}
                style={style}
                dangerouslySetInnerHTML={{ __html: block.data.text }}
              />
            )
          }

          // 📌 Lists
          case 'list': {
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul'
            return (
              <ListTag key={idx} style={style} className="ml-6 list-inside">
                {block.data.items.map((item, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: item }} />
                ))}
              </ListTag>
            )
          }

          // 📌 Checklist (with checkbox support)
          case 'checklist':
            return (
              <ul key={idx} style={style} className="space-y-2">
                {block.data.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <input type="checkbox" checked={item.checked} readOnly />
                    <span dangerouslySetInnerHTML={{ __html: item.text }} />
                  </li>
                ))}
              </ul>
            )

          // 📌 Code block
          case 'code':
            return (
              <pre
                key={idx}
                style={style}
                className="bg-gray-900 text-white p-3 rounded-md overflow-x-auto"
              >
                <code>{block.data.code}</code>
              </pre>
            )

          // 📌 Image with caption
          case 'image':
            return (
              <figure key={idx} className="my-4 text-center">
                <img
                  src={block.data.file?.url || block.data.url}
                  alt={block.data.caption || 'Image'}
                  className="mx-auto rounded-lg shadow-md"
                  style={style}
                />
                {block.data.caption && (
                  <figcaption className="text-sm text-gray-500 mt-2">
                    {block.data.caption}
                  </figcaption>
                )}
              </figure>
            )

          // 📌 Embedded content (YouTube, Twitter, etc.)
          case 'embed':
            return (
              <div key={idx} className="my-4">
                <iframe
                  src={block.data.embed || block.data.source}
                  title={block.data.caption || 'Embedded Content'}
                  className="w-full h-64 rounded-md"
                  style={style}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin"
                />
                {block.data.caption && (
                  <p className="text-xs text-gray-500 mt-1">
                    {block.data.caption}
                  </p>
                )}
              </div>
            )

          default:
            return null
        }
      })}
    </div>
  )
}

const EditorRender = memo(EditorRenderComponent) // ✅ Prevent unnecessary re-renders
export default EditorRender
