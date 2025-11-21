import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const WriterProfile = () => {
  const { id } = useParams();
  const [writer, setWriter] = useState(null);
  const [poems, setPoems] = useState([]);

  useEffect(() => {
    axios
      .get(`/api/writer/${id}`)
      .then((res) => {
        setWriter(res.data.writer);
        setPoems(res.data.poems);
      })
      .catch((err) => console.log(err));
  }, [id]);

  if (!writer)
    return (
      <p className="text-center mt-10 text-gray-600 animate-pulse">
        Loading...
      </p>
    );

  return (
    <div className="min-h-screen bg-[#f4f4f4] dark:bg-[#071126]">
      {/* Top Gradient Header */}
      <div className="w-full h-60 sm:h-72 bg-gradient-to-r from-[#F6A760] to-[#F29E7A] rounded-b-3xl shadow-md"></div>

      {/* Profile Card */}
      <div className="max-w-4xl mx-auto px-4 -mt-24">
        <div className="bg-white dark:bg-[#0c1c2a] rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center text-center">
            <img
              src={writer.avatar || "/default-avatar.png"}
              alt={writer.fullName}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white dark:border-gray-600 shadow-md object-cover"
            />

            <h1 className="text-3xl font-bold mt-4 dark:text-white">
              {writer.fullName}
            </h1>

            {writer.tagline && (
              <p className="text-[#8B1E3F] mt-1 font-medium text-lg">
                {writer.tagline}
              </p>
            )}

            <div className="flex items-center justify-center gap-4 mt-2 text-gray-500 dark:text-gray-400">
              {writer.profession && (
                <span className="text-sm">{writer.profession}</span>
              )}
              {writer.location && (
                <span className="text-sm">{writer.location}</span>
              )}
            </div>

            {writer.bio && (
              <p className="max-w-xl mx-auto text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">
                {writer.bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Poems Section */}
      <div className="max-w-6xl mx-auto px-4 mt-10">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Poems by {writer.fullName}
        </h2>

        {poems.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 text-lg p-8 border border-dashed rounded-xl">
            No poems published yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
            {poems.map((poem) => (
              <div
                key={poem._id}
                className="bg-white dark:bg-[#0c1c2a] rounded-xl p-5 shadow hover:shadow-lg transition duration-300 border border-gray-100 dark:border-gray-700"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2">
                  {poem.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-3 leading-relaxed">
                  {poem.content}
                </p>

                {/* Read More Link */}
                <div className="mt-3">
                  <a
                    href={`/poem/${poem.slug}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Read More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <br />
      <br />
    </div>
  );
};

export default WriterProfile;
