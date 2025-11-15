import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const WriterProfile = () => {
  const { id } = useParams();
  const [writer, setWriter] = useState(null);
  const [poems, setPoems] = useState([]);

  useEffect(() => {
    axios.get(`/api/writer/${id}`)
      .then(res => {
        setWriter(res.data.writer);
        setPoems(res.data.poems);
      })
      .catch(err => console.log(err));
  }, [id]);

  if (!writer) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* Writer Header */}
      <div className="flex items-center gap-4 border-b pb-4">
        <img
          src={writer.avatar || "/default-avatar.png"}
          alt={writer.fullName}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div>
          <h1 className="text-2xl font-bold">{writer.fullName}</h1>
          <p className="text-gray-600">{writer.tagline}</p>
          <p className="text-gray-500">{writer.profession}</p>
        </div>
      </div>

      {/* Writer Bio */}
      {writer.bio && (
        <p className="mt-4 text-gray-700">{writer.bio}</p>
      )}

      {/* All Poems */}
      <h2 className="mt-6 mb-3 text-xl font-semibold">Poems by {writer.fullName}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {poems.map(poem => (
          <div key={poem._id} className="border p-4 rounded-md shadow">
            <h3 className="font-bold">{poem.title}</h3>
            <p className="text-gray-600 line-clamp-3">{poem.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WriterProfile;
