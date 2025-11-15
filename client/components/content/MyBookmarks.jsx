import { useEffect, useState } from "react";

export default function MyBookmarks({ token }) {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      const res = await fetch("/api/bookmarks/my-bookmarks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBookmarks(data.bookmarks);
    };
    fetchBookmarks();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-[#8B1E3F]">मेरे बुकमार्क्स</h1>
      {bookmarks.length === 0 ? (
        <p>कोई कविता बुकमार्क नहीं की गई।</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bookmarks.map((poem) => (
            <div key={poem._id} className="p-4 border rounded-lg shadow">
              <h3 className="font-bold text-lg">{poem.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{poem.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
