'use client'

import { useState } from 'react'
import Link from 'next/link'
import InfiniteScroll from 'react-infinite-scroll-component'
import api from '@/utils/api'
import SectionDivider from '@/common/SectionDivider'

const getCategorySlug = (item) => {
  if (Array.isArray(item.categories) && item.categories.length > 0) {
    const cat = item.categories.find((c) => c?.slug)
    if (cat) return cat.slug
  }
  return 'main-news'
}

export default function RelatedNewsClient({ initialItems, categorySlug }) {
  const [items, setItems] = useState(initialItems || [])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialItems.length > 0)
  const limit = 5

  const fetchMoreData = async () => {
    try {
      const res = await api.get('/news/paginated/list', {
        params: { page: page + 1, limit, category: categorySlug },
      })
      if (res.data?.length) {
        setItems((prev) => [...prev, ...res.data])
        setPage((prev) => prev + 1)
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Error loading more related news:', err)
      setHasMore(false)
    }
  }

  return (
    <div>
      <SectionDivider text="संबंधित खबरें" />
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        hasMore={hasMore}
        loader={<p className="text-center py-4 text-gray-500">Loading...</p>}
      >
        <div className="space-y-4">
          {items.map((item) => (
            <Link
              key={item._id}
              href={`/news/${getCategorySlug(item)}/${item.slug}`}
              className="flex ... group"
            >
              {/* ... Your JSX for a single related news item ... */}
              <div className="w-full sm:w-28 h-28 sm:h-20 overflow-hidden flex-shrink-0 aspect-video">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-fill ..."
                />
              </div>
              <div className="p-3 flex-1">
                <h3 className="text-sm font-semibold ...">{item.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  )
}
