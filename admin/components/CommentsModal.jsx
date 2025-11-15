"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from "@/utils/api"; // ✅ Aapka admin-wala api instance

// Recursive component to display each comment and its replies
const CommentRow = ({ comment, onDelete }) => (
  <div className="ml-4 mt-2 border-l-2 pl-4 py-2">
    <div className="bg-gray-50 p-3 rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold text-primary">{comment.user?.name || 'Guest'}</p>
          <p className="text-sm text-gray-700 mt-1">{comment.comment}</p>
          <p className="text-xs text-gray-400 mt-2">{new Date(comment.createdAt).toLocaleString()}</p>
        </div>
        <button 
          onClick={() => onDelete(comment._id)}
          className="text-red-500 hover:text-red-700 p-2"
          title="Delete Comment"
        >
          <FaTrash />
        </button>
      </div>
      {comment.replies?.map(reply => (
        <CommentRow key={reply._id} comment={reply} onDelete={onDelete} />
      ))}
    </div>
  </div>
);

export default function CommentsModal({ isOpen, onClose, newsItem }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    if (!newsItem?._id) return;
    setLoading(true);
    try {
      // ✅ FIX: Direct API call using the 'api' instance
      const { data } = await api.get(`/comments/news/${newsItem._id}`);
      setComments(data || []);
    } catch (err) {
      console.error("Failed to load comments:", err);
      toast.error("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadComments();
    }
  }, [isOpen, newsItem]);

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment and all its replies?')) return;
    
    try {
      // ✅ FIX: Direct API call using the 'api' instance
      await api.delete(`/comments/${commentId}`);
      toast.success('Comment deleted successfully');
      loadComments(); // Refresh the comment list
    } catch (err) {
      console.error("Failed to delete comment:", err);
      toast.error("Failed to delete comment.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div 
        className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-lg font-bold text-primary truncate pr-4">Comments for: {newsItem?.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2">
          {loading ? (
            <p>Loading comments...</p>
          ) : comments.length > 0 ? (
            comments.map(comment => (
              <CommentRow key={comment._id} comment={comment} onDelete={handleDelete} />
            ))
          ) : (
            <p className="text-center text-gray-500 py-8">No comments found for this article.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}