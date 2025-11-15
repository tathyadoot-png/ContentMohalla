"use client";
import React, { useEffect, useState } from "react";
import { FaReply } from "react-icons/fa";
import { fetchCommentsForNews, postComment } from "@/services/newsService";
import { useGuest } from "@/context/GuestContext";

// ==================================
// 1. Recursive Component (Har ek comment aur uske reply ke liye)
// ==================================
const Comment = ({ comment, onReply }) => {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = () => {
    if (!replyText.trim()) return;
    onReply(replyText, comment._id);
    setReplyText("");
    setShowReplyBox(false);
  };

  return (
    <div className="ml-4 mt-4 border-l-2 border-custom pl-4">
      <div className="bg-card shadow-sm rounded-lg p-3 transition-shadow duration-200">
        <div className="flex justify-between items-center mb-1">
          <p className="font-semibold text-primary">{comment?.user?.name || "अतिथि"}</p>
          <span className="text-xs text-accent">
            {new Date(comment.createdAt).toLocaleString('hi-IN')}
          </span>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{comment.comment}</p>

        <button
          onClick={() => setShowReplyBox(!showReplyBox)}
          className="flex items-center gap-1 text-sm text-primary mt-2 hover:underline"
        >
          <FaReply /> उत्तर दें
        </button>

        {showReplyBox && (
          <div className="mt-2">
            <textarea
              className="w-full border border-custom p-2 rounded focus:outline-primary bg-transparent"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="अपना उत्तर लिखें..."
              rows="2"
            />
            <button 
              onClick={handleReplySubmit} 
              className="mt-2 px-4 py-1 bg-accent text-primary rounded hover:bg-hoverAccent text-sm transition-colors"
            >
              उत्तर भेजें
            </button>
          </div>
        )}

        {/* Replies ko recursively render karein */}
        {Array.isArray(comment.replies) &&
          comment.replies.map((reply) => <Comment key={reply._id} comment={reply} onReply={onReply} />)}
      </div>
    </div>
  );
};


// ==================================
// 2. Main Comments Component
// ==================================
const Comments = ({ newsId }) => {
  const { guestUser } = useGuest();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    if (!newsId) return;

    const loadComments = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedComments = await fetchCommentsForNews(newsId);
        setComments(fetchedComments);
      } catch (err) {
        console.error("Failed to load comments", err);
        setError("टिप्पणियाँ लोड नहीं हो सकीं।");
      } finally {
        setLoading(false);
      }
    };
    
    loadComments();
  }, [newsId]);

  const handleSubmit = async (text, parentId = null) => {
    if (!guestUser) {
      alert("टिप्पणी करने के लिए कृपया लॉग इन करें।");
      return;
    }
    try {
      await postComment(newsId, text, parentId);
      const updatedComments = await fetchCommentsForNews(newsId);
      setComments(updatedComments);

      if (!parentId) {
        setCommentText("");
      }
    } catch (err) {
      console.error("Failed to post comment", err);
      alert("टिप्पणी भेजने में विफल। कृपया पुन: प्रयास करें।");
    }
  };

  return (
    <div className="mt-8">
      <h3 className="text-2xl font-bold mb-6 text-primary border-b-2 border-accent pb-2">टिप्पणियाँ</h3>

      {/* Main Comment Input Box */}
      <div className="flex flex-col gap-2 mb-6 bg-card p-4 rounded-lg border border-custom shadow-sm">
        <textarea
          placeholder="अपनी टिप्पणी लिखें..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="border border-custom p-2 rounded focus:outline-primary bg-transparent"
          rows="3"
        />
        <button
          onClick={() => handleSubmit(commentText)}
          className="mt-2 bg-primary text-secondary w-max px-6 py-2 rounded hover:bg-hoverAccent transition-colors"
        >
          भेजें
        </button>
      </div>

      {/* Display Area */}
      {loading && <p className="text-muted">टिप्पणियाँ लोड हो रही हैं...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && comments.length === 0 && <p className="text-muted">अभी तक कोई टिप्पणी नहीं है। टिप्पणी करने वाले पहले व्यक्ति बनें!</p>}
      
      {comments.map((rootComment) => (
        <Comment key={rootComment._id} comment={rootComment} onReply={handleSubmit} />
      ))}
    </div>
  );
};

export default Comments;