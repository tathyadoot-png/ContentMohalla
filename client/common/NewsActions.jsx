'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaBookmark, FaRegBookmark } from 'react-icons/fa';
// ✅ FIX: Renamed imported functions to match your service file
import { toggleLike, toggleBookmark } from '@/services/newsService'; // Adjust the import path as needed

// Helper to get user info from localStorage
const getGuestProfile = () => {
  if (typeof window !== 'undefined') {
    const profile = localStorage.getItem('guestProfile'); // Use the key where you store guest/user data
    return profile ? JSON.parse(profile) : null;
  }
  return null;
};

export default function NewsActions({ news }) {
  const [likes, setLikes] = useState(news.likesCount);
  const [isLiked, setIsLiked] = useState(false);
  
  const [bookmarks, setBookmarks] = useState(news.bookmarksCount);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [guestId, setGuestId] = useState(null);

  // On component mount, check if the current user has liked/bookmarked this article
 useEffect(() => {
    // ✅ Yahan hum logs add karenge
    console.log("--- NewsActions Debug Start ---");
    const profile = getGuestProfile();
    console.log("1. Profile found in localStorage:", profile);

    if (profile?._id) {
      console.log("2. Profile is valid. Setting guestId:", profile._id);
      setGuestId(profile._id);
      
      if (news.likedBy?.includes(profile._id)) {
        setIsLiked(true);
      }
      if (news.bookmarkedBy?.includes(profile._id)) {
        setIsBookmarked(true);
      }
    } else {
      console.log("2. No valid profile found. User is not logged in for this component.");
    }
    console.log("--- NewsActions Debug End ---");

  }, [news.likedBy, news.bookmarkedBy]);

  const handleLike = async () => {
    if (!guestId) {
      alert('Please log in to like articles.'); // Or redirect to login
      return;
    }

    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      // ✅ FIX: Using the correct function name from your service
      await toggleLike(news._id);
    } catch (error) {
      console.error('Failed to update like:', error);
      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
      alert('Something went wrong. Please try again.');
    }
  };

  const handleBookmark = async () => {
    if (!guestId) {
      alert('Please log in to bookmark articles.');
      return;
    }

    setIsBookmarked((prev) => !prev);
    setBookmarks((prev) => (isBookmarked ? prev - 1 : prev + 1));

    try {
      // ✅ FIX: Using the correct function name from your service
      await toggleBookmark(news._id);
    } catch (error) {
      console.error('Failed to update bookmark:', error);
      setIsBookmarked((prev) => !prev);
      setBookmarks((prev) => (isBookmarked ? prev - 1 : prev + 1));
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex items-center gap-4 text-accent">
      <button onClick={handleLike} className="flex items-center gap-2 hover:text-red-500 transition-colors">
        {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
        <span>{likes}</span>
      </button>
      <button onClick={handleBookmark} className="flex items-center gap-2 hover:text-blue-500 transition-colors">
        {isBookmarked ? <FaBookmark className="text-blue-500" /> : <FaRegBookmark />}
        <span>{bookmarks}</span>
      </button>
    </div>
  );
}