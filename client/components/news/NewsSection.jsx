import { FaClock, FaUser, FaMapMarkerAlt } from 'react-icons/fa'
import EditorRender from '../../common/EditorRender'

/* ---------- Helpers ---------- */
function formatDate(dateStr) {
  if (!dateStr) return 'आज'
  const date = new Date(dateStr)
  return date.toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'short',
  })
}

function SectionHeading({ children }) {
  return (
    <h3 className="text-lg font-serif font-bold text-primary mb-4 border-b-2 border-primary pb-2">
      {children}
    </h3>
  )
}

/* ---------- Main Component ---------- */
export default function NewsSection({ section, news, category }) {
  if (!news || news.length === 0) return null

  const renderMetaRow = (item) => (
    <div className="flex flex-wrap gap-3 text-xs text-gray-500 items-center mt-1">
      {/* Author */}
      <span className="flex items-center gap-1">
        <FaUser className="text-accent" />
        {item.authoredBy?._id ? (
          <a
            href={`/author/${item.authoredBy._id}`}
            className="hover:underline hover:text-accent"
          >
            {item.authoredBy.name}
          </a>
        ) : (
          'By Admin'
        )}
      </span>

      {/* Desk Location */}
      {item.deskLocation && (
        <span className="flex items-center gap-1">
          <FaMapMarkerAlt className="text-accent" />
          {item.deskLocation}
        </span>
      )}

      {/* Date */}
      {item.date && (
        <span className="flex items-center gap-1">
          <FaClock className="text-accent" />
          {formatDate(item.date)}
        </span>
      )}
    </div>
  )

  // === Main Section Logic (unchanged) ===
  if (section.toLowerCase() === 'main') {
    const mainNews = news.slice(0, 2)
    const popularNews = news.filter((n) =>
      n.categories?.some((c) => c.section?.popular?.show)
    )
    const latestNews = news.filter((n) =>
      n.categories?.some((c) => c.section?.latest?.show)
    )
    const otherNews = news.filter((n) =>
      n.categories?.some((c) => c.section?.other?.show)
    )

    return (
      <div className="space-y-10">
        {/* Top Section: Popular | Main | Latest */}
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
          {/* Popular (Left) */}
          <div className="order-2 lg:order-1 lg:col-span-2">
            <NewsList title="लोकप्रिय" news={popularNews} />
          </div>

          {/* Main News (Middle) */}
          <div className="order-1 lg:order-2 lg:col-span-5 flex flex-col gap-6">
            {mainNews.map((item) => (
              <div
                key={item._id}
                className="rounded-xl overflow-hidden border border-custom bg-card shadow-md hover:shadow-lg transition"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-72 object-fill"
                  />
                )}
                <div className="p-6 space-y-3">
                  <a
                    href={`/news/${category}/${item.slug}`}
                    className="text-2xl font-serif font-bold text-primary hover:text-accent transition"
                  >
                    {item.title}
                  </a>

                  {/* ✅ Meta Row */}
                  {renderMetaRow(item)}

                  <div className="text-accent text-sm max-w-3xl line-clamp-3">
                    <EditorRender content={item.description} />
                  </div>
                  <a
                    href={`/news/${category}/${item.slug}`}
                    className="inline-block mt-2 px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition"
                  >
                    और पढ़ें →
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Latest (Right) */}
          <div className="order-3 lg:order-3 lg:col-span-2">
            <div className="bg-card shadow-lg border border-custom p-3 rounded-xl">
              <SectionHeading>ताज़ा</SectionHeading>

              {latestNews.length > 0 && (
                <>
                  <div className="mb-5 rounded-lg overflow-hidden shadow hover:shadow-md transition">
                    {latestNews[0].imageUrl && (
                      <img
                        src={latestNews[0].imageUrl}
                        alt={latestNews[0].title}
                        className="w-full h-40 object-fill"
                      />
                    )}
                    <div className="p-3 space-y-2">
                      <a
                        href={`/news/${category}/${latestNews[0].slug}`}
                        className="text-base font-serif font-bold text-primary hover:text-accent transition"
                      >
                        {latestNews[0].title}
                      </a>

                      {/* ✅ Meta Row */}
                      {renderMetaRow(latestNews[0])}

                      <div className="text-sm text-accent line-clamp-2">
                        <EditorRender content={latestNews[0].description} />
                      </div>
                    </div>
                  </div>

                  {/* Remaining latest news */}
                  <ul className="space-y-3">
                    {latestNews.slice(1).map((n, idx) => (
                      <li
                        key={n._id}
                        className="flex items-start gap-3 border-b border-custom pb-2"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-white text-xs font-bold">
                          {idx + 1}
                        </span>

                        <div className="flex flex-col">
                          <a
                            href={`/news/${category}/${n.slug}`}
                            className="text-sm font-serif font-semibold text-primary hover:text-accent"
                          >
                            {n.title}
                          </a>

                          {/* ✅ Meta Row */}
                          {renderMetaRow(n)}

                          <div className="text-xs text-accent line-clamp-2 mt-1">
                            <EditorRender content={n.description} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Other News (Bottom Full Width) */}
        {otherNews.length > 0 && (
          <div>
            <SectionHeading>अन्य खबरें</SectionHeading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherNews.map((n) => (
                <div
                  key={n._id}
                  className="flex items-center gap-5 p-4 border border-custom bg-card rounded-xl shadow-sm hover:shadow-md transition hover:-translate-y-1"
                >
                  {n.imageUrl && (
                    <a
                      href={`/news/${category}/${n.slug}`}
                      className="flex-shrink-0 w-40 h-28 overflow-hidden rounded-lg"
                    >
                      <img
                        src={n.imageUrl}
                        alt={n.title}
                        className="w-full h-full object-fill transition-transform duration-300 hover:scale-105"
                      />
                    </a>
                  )}
                  <div className="flex flex-col flex-grow">
                    <a
                      href={`/news/${category}/${n.slug}`}
                      className="text-lg font-serif font-semibold text-primary hover:text-accent transition"
                    >
                      {n.title}
                    </a>

                    {/* ✅ Meta Row */}
                    {renderMetaRow(n)}

                    <div className="text-sm text-accent mt-2 line-clamp-3">
                      <EditorRender content={n.description} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return null
}

/* ---------- Popular/Generic List Component ---------- */
function NewsList({ title, news }) {
  if (!news || news.length === 0) return null

  const renderMetaRow = (item) => (
    <div className="flex flex-wrap gap-3 text-xs text-gray-500 items-center mt-1">
      <span className="flex items-center gap-1">
        <FaUser className="text-accent" />
        {item.authoredBy?._id ? (
          <a
            href={`/author/${item.authoredBy._id}`}
            className="hover:underline hover:text-accent"
          >
            {item.authoredBy.name}
          </a>
        ) : (
          'By Admin'
        )}
      </span>
      {item.deskLocation && (
        <span className="flex items-center gap-1">
          <FaMapMarkerAlt className="text-accent" />
          {item.deskLocation}
        </span>
      )}
      {item.date && (
        <span className="flex items-center gap-1">
          <FaClock className="text-accent" />
          {formatDate(item.date)}
        </span>
      )}
    </div>
  )

  return (
    <div className="bg-card shadow-lg border border-custom p-3 rounded-xl">
      <SectionHeading>{title}</SectionHeading>
      <ul
        className={`space-y-4 ${
          news.length > 5
            ? 'max-h-[600px] overflow-y-auto pr-2 scrollbar-thin'
            : ''
        }`}
      >
        {news.map((n) => (
          <li
            key={n._id}
            className="flex flex-col border-b border-custom pb-3 hover:bg-muted p-2 transition cursor-pointer rounded-md"
          >
            {n.imageUrl && (
              <img
                src={n.imageUrl}
                alt={n.title}
                className="w-full h-28 object-fill mb-2 rounded-lg"
              />
            )}
            <a
              href={`/news/${n.categories?.[0]?.slug || ''}/${n.slug}`}
              className="text-sm font-serif font-semibold text-primary hover:text-accent"
            >
              {n.title}
            </a>

            {/* ✅ Meta Row */}
            {renderMetaRow(n)}
          </li>
        ))}
      </ul>
    </div>
  )
}
