import Image from "next/image";

export default async function WriterProfile({ params }) {
  const { id } = params;

// Writer details
const writerRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/writer/${id}`,
  { cache: "no-store" }
);
const writerData = await writerRes.json();
const writer = writerData.writer;

// Poems by this writer
const poemsRes = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/writer/writer/${id}`,
  { cache: "no-store" }
);
const poems = await poemsRes.json();


  return (
    <div className="w-[90%] mx-auto py-10">
      {/* Writer Info */}
      <div className="flex items-start gap-6">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 relative">
          {writer?.avatar ? (
            <Image src={writer.avatar} fill alt="avatar" className="object-cover" />
          ) : (
            <div className="flex items-center justify-center text-4xl">👤</div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold">{writer?.fullName}</h1>
          {writer?.penName && (
            <p className="text-gray-500 -mt-1">@{writer.penName}</p>
          )}
          {writer?.bio && <p className="mt-3 text-gray-700">{writer.bio}</p>}
        </div>
      </div>

      {/* All Poems by Writer */}
      <h2 className="text-2xl font-bold mt-10 mb-4">Poems by this Writer</h2>

      {poems?.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {poems.map((p) => (
            <div
              key={p._id}
              className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <h3 className="font-bold text-lg">{p.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {p.metaDescription || p.content?.slice(0, 100)}
              </p>

              <a
                href={`/${p.category}/${p.subcategory}/${p.slug}`}
                className="text-blue-600 text-sm mt-3 inline-block"
              >
                Read More →
              </a>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-2">This writer hasn't posted any poems.</p>
      )}
    </div>
  );
}
