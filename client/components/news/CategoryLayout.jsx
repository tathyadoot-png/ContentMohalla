import Link from 'next/link';
import Image from 'next/image';
import NewsList from './EnhancedNewsList';
import MetaInfo from '@/common/MetaInfo';


export default function CategoryLayout({ category, mainNews, popularNews, latestNews }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
      {/* Popular (Left) */}
      <div className="order-2 lg:order-1 lg:col-span-2">
        <NewsList title="लोकप्रिय" news={popularNews} category={category} />
      </div>

      {/* Main News (Middle) */}
      <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col gap-6">
        {mainNews.map((item) => (
          <div key={item._id} className="rounded-xl overflow-hidden border border-custom bg-card shadow-md hover:shadow-lg transition-shadow duration-300">
            {item.imageUrl && (
              <Link href={`/news/${category}/${item.slug}`} className="block relative w-full h-72">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority={true} // Mark main images as priority for faster loading
                />
              </Link>
            )}
            <div className="p-6 space-y-3">
              <Link href={`/news/${category}/${item.slug}`}>
                <h2 className="text-2xl font-serif font-bold text-primary hover:text-accent transition-colors">
                  {item.title}
                </h2>
              </Link>
              <MetaInfo
                author={item.authoredBy}
                location={item.deskLocation}
                date={item.date}
              />
              {/* <div className="text-gray-700 max-w-3xl line-clamp-3">
                 {item.description} 
              </div> */}
              <Link href={`/news/${category}/${item.slug}`} className="inline-block mt-2 px-5 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-transform hover:scale-105">
                  और पढ़ें →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Latest (Right) */}
      <div className="order-3 lg:col-span-2">
        <NewsList title="ताज़ा" news={latestNews} category={category} />
      </div>
    </div>
  );
}