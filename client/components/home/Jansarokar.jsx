'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { fetchByCategoryAndSection } from '@/services/newsService'
import MetaInfo from '@/common/MetaInfo' // ✅ Import MetaInfo

export default function Jansarokar() {
  const [news, setNews] = useState([])

  useEffect(() => {
    const fetchJansarokarNews = async () => {
      try {
        const data = await fetchByCategoryAndSection({
          category: 'jansarokar',
        })

        const allNews = [].concat(...Object.values(data || {}))

        const uniqueData = Array.from(
          new Map(
            allNews.map((item) => [item._id || item.title, item])
          ).values()
        )

        setNews(uniqueData)
      } catch (error) {
        console.error('Error fetching Jansarokar news:', error)
      }
    }

    fetchJansarokarNews()
  }, [])

  function getDescriptionText(description) {
    if (!description) return ''
    try {
      const parsed =
        typeof description === 'string' ? JSON.parse(description) : description
      if (parsed?.blocks) {
        return parsed.blocks.map((block) => block.data?.text || '').join(' ')
      }
      return ''
    } catch (error) {
      console.error('Error parsing description:', error)
      return ''
    }
  }

  return (
    <section className="w-full px-4 py-10">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-8 border-b-2 border-accent pb-2">
        Jansarokar
      </h2>

      {news.length > 0 ? (
        <>
          {/* Top 2 big news */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {news.slice(0, 2).map((item, i) => (
              <div
                key={i}
                className="flex flex-col bg-card rounded-xl shadow-lg hover:shadow-2xl overflow-hidden border border-custom cursor-pointer transition"
              >
                <div className="relative w-full h-56">
                  <Image
                    src={item.imageUrl || '/default.jpg'}
                    alt={item.title}
                    fill
                    className="object-fill transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-primary mb-1 hover:text-accent transition-colors">
                    {item.title}
                  </h3>

                  {/* ✅ MetaInfo Component */}
                  <MetaInfo
                    author={item.authoredBy}
                    location={item.deskLocation}
                    date={item.createdAt}
                  />

                  <p className="text-sm text-primary mt-2">
                    {getDescriptionText(item.description)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Next 4 vertical cards */}
          <div className="grid grid-cols-1 gap-6">
            {news.slice(2, 6).map((item, i) => (
              <div
                key={i}
                className="flex flex-row bg-card rounded-lg shadow-sm hover:shadow-md overflow-hidden border border-custom cursor-pointer transition"
              >
                {/* Image Left */}
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                  <Image
                    src={item.imageUrl || '/default.jpg'}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                {/* Text Right */}
                <div className="p-3 flex flex-col justify-between flex-1">
                  <h5 className="text-sm md:text-base font-semibold text-primary hover:text-accent transition-colors mb-1">
                    {item.title}
                  </h5>
                  <p>{item.byline}</p>

                  {/* ✅ MetaInfo Component */}
                  <MetaInfo
                    author={item.authoredBy}
                    location={item.deskLocation}
                    date={item.createdAt}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500">No Jansarokar news available.</p>
      )}
    </section>
  )
}
