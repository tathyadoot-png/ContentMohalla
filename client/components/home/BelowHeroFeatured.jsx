'use client'

import { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper'
import 'swiper/css'
import MetaInfo from '@/common/MetaInfo' // ✅ import MetaInfo
import { fetchByCategoryAndSection, fetchCategories, fetchSummaryStats } from '@/services/newsService'
import { categoryMap } from '@/utils/categoryMap'

export default function BelowHeroFeatured() {
  const [featuredStories, setFeaturedStories] = useState([])
  const [popularPosts, setPopularPosts] = useState([])
  const [categoryCollection, setCategoryCollection] = useState([])
  const [summaryStats, setSummaryStats] = useState(null)
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0)

  const excludedSlugs = new Set([
    'main-news',
    'featured-stories',
    'trending-mudda',
    'jansarokar',
    "editor's-picks",
    'popular',
  ])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const featured = await fetchByCategoryAndSection({ category: 'featured-stories' })
        const allFeatured = [].concat(...Object.values(featured || {}))
        const uniqueFeatured = Array.from(new Map(allFeatured.map((item) => [item._id, item])).values())
        setFeaturedStories(uniqueFeatured)

        const popular = await fetchByCategoryAndSection({ category: 'popular' })
        const allPopular = [].concat(...Object.values(popular || {}))
        const uniquePopular = Array.from(new Map(allPopular.map((item) => [item._id, item])).values())
        setPopularPosts(uniquePopular)

        const categories = await fetchCategories()
        setCategoryCollection(categories || [])

        const summary = await fetchSummaryStats()
        setSummaryStats(summary || null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setFeaturedStories([])
        setPopularPosts([])
        setCategoryCollection([])
        setSummaryStats(null)
      }
    }

    fetchData()
  }, [])

  const filteredCategories = useMemo(
    () => categoryCollection.filter((cat) => !excludedSlugs.has(cat.slug)),
    [categoryCollection]
  )

  const activeCategory = filteredCategories[activeCategoryIndex] || filteredCategories[0]

  return (
    <section className="mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Sidebar */}
        <div className="flex flex-col gap-6 bg-muted rounded-xl p-4">
          <div>
            <h4 className="font-bold text-lg mb-3 text-primary border-b pb-1">Category Collection</h4>
            <Swiper
              modules={[Autoplay]}
              spaceBetween={15}
              slidesPerView={2}
              loop={true}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              className="w-full"
              breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 2 } }}
              onSlideChange={(swiper) => setActiveCategoryIndex(swiper.realIndex)}
            >
              {filteredCategories.map((cat, i) => (
                <SwiperSlide key={i}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="flex flex-col items-center justify-center gap-2 p-1 rounded-xl cursor-pointer text-secondary bg-primary hover:scale-105 transition-transform duration-300"
                  >
                    <h5 className="font-semibold text-center">{categoryMap[cat.slug] || cat.name || 'Category'}</h5>
                    <span className="text-xs">{cat.totalNews || 0} News</span>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {activeCategory && activeCategory.popularNews?.length > 0 && (
            <div className="mt-4 p-3 bg-white rounded-lg shadow-sm flex-1 max-h-[500px] overflow-auto">
              <h5 className="font-semibold text-[#3f3f3f] mb-2">
                {categoryMap[activeCategory.slug] || activeCategory.name} Popular News
              </h5>
              <div className="grid grid-cols-1 gap-3">
                {activeCategory.popularNews.map((post, idx) => (
                  <Link
                    key={post._id || idx}
                    href={`/news/${post.categories?.[0]?.slug || 'unknown-category'}/${post.slug}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:shadow-md transition bg-white cursor-pointer border border-custom"
                  >
                    <div className="w-16 h-16 relative flex-shrink-0 rounded-lg overflow-hidden">
                      <Image
                        src={post.imageUrl || '/default.jpg'}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <h5 className="text-sm md:text-base font-semibold text-[#3f3f3f] line-clamp-2">
                        {post.title}
                      </h5>
                      {/* ✅ Use MetaInfo here */}
                      <MetaInfo
                        author={post.authoredBy}
                        location={post.deskLocation}
                        date={post.createdAt}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Featured Stories */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 border-b-2 border-accent pb-2">
            Featured Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredStories.map((story, i) => (
              <Link
                key={i}
                href={`/news/${story.categories?.[0]?.slug || 'unknown-category'}/${story.slug}`}
                className="flex items-center gap-4 p-3 hover:bg-muted transition cursor-pointer border-b border-gray-200"
              >
                <div className="w-32 h-32 relative flex-shrink-0 rounded-md overflow-hidden">
                  <Image
                    src={story.imageUrl || '/default.jpg'}
                    alt={story.title}
                    fill
                    className="object-fill transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-primary hover:text-accent transition-colors">
                    {story.title}
                  </h3>
                  {/* ✅ MetaInfo */}
                  <MetaInfo
                    author={story.authoredBy}
                    location={story.deskLocation}
                    date={story.createdAt}
                  />
                  <button className="text-sm text-accent px-2 py-1 rounded hover:bg-hover transition w-max mt-1">
                    और पढ़ें
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
