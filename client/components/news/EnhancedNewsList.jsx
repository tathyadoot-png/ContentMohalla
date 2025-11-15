// components/news/NewsList.jsx
import Link from "next/link";
import Image from "next/image";
import MetaInfo from "@/common/MetaInfo";

export default function EnhancedNewsList({ title, news, category, variant }) {
  if (!news || news.length === 0) return null;

  return (
    <div className="bg-card shadow-xl border border-custom p-6 rounded-2xl">
      {title && (
        <h3 className="text-2xl font-serif font-bold text-primary mb-6 border-b-4 border-accent pb-2 inline-block">
          {title}
        </h3>
      )}

      {/* LATEST NEWS → TIMELINE STYLE */}
      {variant === "latest" && (
        <div className="relative pl-6 border-l-2 border-accent space-y-6">
          {news.map((item) => (
            <Link
              href={`/news/${category}/${item.slug}`}
              key={item._id}
              className="group flex gap-4 relative"
            >
              <span className="absolute -left-[35px] w-5 h-5 rounded-full bg-accent border-4 border-card" />
              {item.imageUrl && (
                <div className="relative w-32 h-20 rounded-md overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                  />
                </div>
              )}
              <div>
                <h4 className="text-lg font-serif font-semibold text-primary group-hover:text-accent transition-colors">
                  {item.title}
                </h4>
                <MetaInfo
                  author={item.authoredBy}
                  date={item.date}
                  location={item.deskLocation}
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* POPULAR NEWS → GRID CARDS */}
      {variant === "popular" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item) => (
            <Link
              href={`/news/${category}/${item.slug}`}
              key={item._id}
              className="group block overflow-hidden rounded-xl border border-custom shadow-md hover:shadow-xl transition-all"
            >
              {item.imageUrl && (
                <div className="relative w-full h-48">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded-md shadow">
                    {category}
                  </span>
                </div>
              )}
              <div className="p-4">
                <h4 className="text-md font-serif font-semibold text-primary group-hover:text-accent">
                  {item.title}
                </h4>
                {item.excerpt && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {item.excerpt}
                  </p>
                )}
                <MetaInfo
                  author={item.authoredBy}
                  date={item.date}
                  location={item.deskLocation}
                />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* OTHER NEWS → COMPACT LIST */}
      {variant === "other" && (
        <ul className="divide-y divide-custom">
          {news.map((item) => (
            <li key={item._id} className="py-4">
              <Link
                href={`/news/${category}/${item.slug}`}
                className="group flex items-center gap-4"
              >
                {item.imageUrl && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-md font-serif font-semibold text-primary group-hover:text-accent transition-colors">
                    {item.title}
                  </h4>
                  <MetaInfo author={item.authoredBy} date={item.date} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
