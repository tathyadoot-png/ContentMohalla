'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaFire } from 'react-icons/fa'
import { fetchByCategoryAndSection } from '@/services/newsService'
import MetaInfo from '@/common/MetaInfo' // ✅ Reusable component import

export default function FeaturedSection() {
  const [featured, setFeatured] = useState(null)
  const [sideNews, setSideNews] = useState([])

  // --- Get category slug safely
  const getCategorySlug = (newsItem) =>
    newsItem.categories?.[0]?.slug || 'unknown-category'

  useEffect(() => {
    const getNews = async () => {
      try {
        const response = await fetchByCategoryAndSection({
          category: 'main-news',
        })
        const allNewsObj = response || {}
        const allNews = [].concat(...Object.values(allNewsObj))

        const sorted = [...allNews].sort(
          (a, b) => (a.sectionPriority || 99) - (b.sectionPriority || 99)
        )

        setFeatured(sorted[0] || null)
        setSideNews(sorted.slice(1, 5))
      } catch (err) {
        console.error('Error fetching news:', err)
        setFeatured(null)
        setSideNews([])
      }
    }

    getNews()
  }, [])

  if (!featured) return null

  return (
    <section className="mx-auto px-3 md:px-10 py-6 md:py-12">
      <h2 className="flex items-center gap-2 text-lg md:text-2xl font-bold border-b pb-3 mb-6 md:mb-10 text-primary">
        <FaFire className="text-accent" /> आज की प्रमुख खबरें
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        {/* Featured Story */}
        <div className="md:col-span-2 flex flex-col gap-3">
          <Link href={`/news/${getCategorySlug(featured)}/${featured.slug}`}>
            <h3 className="text-2xl md:text-4xl font-bold font-serif text-primary hover:text-accent transition-colors">
              {featured.title}
            </h3>
          </Link>

          {/* ✅ Using reusable MetaInfo */}
          <MetaInfo
            author={featured.authoredBy}
            location={featured.deskLocation}
            date={featured.createdAt}
            withTime={true} // detail ke liye time bhi show karna ho to true
          />

          {featured.byLine && (
            <p className="text-secondary/90 text-base md:text-lg mt-2">
              {featured.byLine}
            </p>
          )}

          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={featured.imageUrl || '/fallback.jpg'}
              alt={featured.title}
              fill
              className="object-fill bg-black"
            />
          </div>
        </div>

        {/* Side News */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sideNews.map((news, i) => (
            <Link
              key={i}
              href={`/news/${getCategorySlug(news)}/${news.slug}`}
              className="flex flex-col border border-custom rounded-lg overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <div className="relative w-full h-60 sm:h-32 lg:h-24">
                <Image
                  src={news.imageUrl || '/fallback.jpg'}
                  alt={news.title}
                  fill
                  className="object-fill rounded-lg bg-black"
                />
              </div>

              <div className="p-3 flex flex-col gap-1">
                <h4 className="font-semibold text-primary hover:text-accent line-clamp-2">
                  {news.title}
                </h4>

                {/* ✅ MetaInfo reused */}
                <MetaInfo
                  author={news.authoredBy}
                  location={news.deskLocation}
                  date={news.createdAt}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
