import React, { useEffect, useState, useMemo, memo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faMessage,
  faShareNodes,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../../Auth/Auth";
import ProfileLogo from "../../assets/ProfileLogo.jfif";
import { NavLink } from "react-router";

/* =========================================================
   Time Formatter
========================================================= */
const formatTimeAgo = (createdAt) => {
  if (!createdAt) return "";
  const postDate = new Date(createdAt);
  const now = new Date();
  const diffMs = now - postDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Yesterday";

  return postDate.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/* =========================================================
   Image Modal
========================================================= */
const ImageModal = ({ src, onClose }) => {
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-6 text-white text-3xl font-bold"
        onClick={onClose}
      >
        ✕
      </button>
      <img
        src={src}
        alt="Preview"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] max-w-[95vw] object-contain rounded-xl shadow-2xl"
      />
    </div>
  );
};

/* =========================================================
   Avatar & Media
========================================================= */
const Avatar = memo(({ src, alt }) => (
  <NavLink to="/userprofile">
    <img
      src={src || ProfileLogo}
      alt={alt}
      className="w-12 h-12 rounded-full object-cover"
    />
  </NavLink>
));

const MediaRenderer = memo(({ mediaUrl, mediaType, onImageClick }) => {
  if (!mediaUrl) return null;
  if (mediaType === "video") {
    return (
      <video
        src={mediaUrl}
        controls
        className="w-full max-h-[600px] object-contain rounded-xl mt-4"
      />
    );
  }
  return (
    <img
      src={mediaUrl}
      alt="Post"
      onClick={() => onImageClick(mediaUrl)}
      className="w-full max-h-[600px] object-cover rounded-xl mt-4 cursor-pointer hover:opacity-90 transition"
    />
  );
});

/* =========================================================
   Feed Item Component
========================================================= */
const FeedItem = memo(({ post, index }) => {
  const [likes, setLikes] = useState(post.likes_count || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(post.comments_list || []);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [openImage, setOpenImage] = useState(null);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments([
      {
        id: Date.now(),
        user: { name: "You", profile_photo: null },
        text: commentText,
      },
      ...comments,
    ]);
    setCommentText("");
  };

  const handleShare = async (post) => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SocialLoop",
          text: post.content || "Check this post",
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      alert("Post link copied!");
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  return (
    <article 
      style={{ animationDelay: `${index * 100}ms` }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 max-w-2xl mx-auto animate-slide-up border border-gray-100 hover-lift"
    >
      {/* Header */}
      <header className="flex items-center gap-3 pb-3 border-b border-gray-100">
        <Avatar src={post.user?.profile_photo} alt={post.user?.name} />
        <div className="flex-1">
          <NavLink to="/userprofile">
            <p className="font-semibold text-gray-900 hover:text-blue-600 transition">
              {post.user?.name || "Unknown"}
            </p>
          </NavLink>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <FontAwesomeIcon icon={faClock} className="w-3 h-3" />
            {formatTimeAgo(post.created_at)}
          </p>
        </div>
      </header>

      {/* Content */}
      {post.content && (
        <p className="mt-4 text-gray-900 leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
      )}

      <MediaRenderer
        mediaUrl={post.media_url}
        mediaType={post.media_type}
        onImageClick={setOpenImage}
      />

      {/* Engagement Stats */}
      {(likes > 0 || comments.length > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-600 px-2">
          <span className="flex items-center gap-1">
            <span className="text-blue-600 font-semibold">{likes}</span> likes
          </span>
          <span className="flex items-center gap-1">
            {comments.length} {comments.length === 1 ? "comment" : "comments"}
          </span>
        </div>
      )}

      {/* Actions */}
      <footer className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-gray-600">

          {/* LIKE */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 flex-1 justify-center hover-lift ${
              isLiked
                ? "text-blue-600 bg-blue-50"
                : "hover:bg-gray-100 hover:text-blue-600"
            }`}
          >
            <FontAwesomeIcon icon={faThumbsUp} />
            <span className="text-sm font-medium">{isLiked ? "Liked" : "Like"}</span>
          </button>

          {/* COMMENT */}
          <button
            onClick={() => setShowCommentInput(!showCommentInput)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 hover:text-blue-600 transition-all duration-200 flex-1 justify-center hover-lift"
          >
            <FontAwesomeIcon icon={faMessage} />
            <span className="text-sm font-medium">Comment</span>
          </button>

          {/* SHARE */}
          <button
            onClick={() => handleShare(post)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-50 hover:text-green-600 transition-all duration-200 flex-1 justify-center hover-lift"
          >
            <FontAwesomeIcon icon={faShareNodes} />
            <span className="hidden sm:inline text-sm font-medium">Share</span>
          </button>

        </div>
      </footer>

      {/* Comment Input */}
      {showCommentInput && (
        <form onSubmit={handleCommentSubmit} className="mt-4 pt-4 border-t border-gray-100 flex gap-2 animate-slide-down">
          <input
            className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 rounded-full font-medium hover:shadow-lg transition-all duration-200 hover-lift">
            Send
          </button>
        </form>
      )}

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
          {comments.slice(0, 2).map((comment, idx) => (
            <div 
              key={comment.id} 
              style={{ animationDelay: `${idx * 50}ms` }}
              className="animate-slide-up"
            >
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-900 text-sm">{comment.user?.name}</p>
                <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
              </div>
            </div>
          ))}
          {comments.length > 2 && (
            <button className="text-blue-600 text-sm font-medium hover:underline">
              View all {comments.length} comments
            </button>
          )}
        </div>
      )}

      {/* Image Modal */}
      {openImage && <ImageModal src={openImage} onClose={() => setOpenImage(null)} />}
    </article>
  );
});

/* =========================================================
   Main Feed Component
========================================================= */
export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);

        // 1️⃣ Fetch all posts
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });
        if (postsError) throw postsError;
        if (!postsData) return;

        // 2️⃣ Get all user IDs from posts
        const userIds = [...new Set(postsData.map((p) => p.user_id))];

        // 3️⃣ Fetch user info for those IDs
        const { data: usersData, error: usersError } = await supabase
          .from("userData")
          .select("id, name, profile_photo")
          .in("id", userIds);
        if (usersError) throw usersError;

        // 4️⃣ Merge posts + user info manually
        const merged = postsData.map((post) => ({
          ...post,
          user: usersData.find((u) => String(u.id) === String(post.user_id)) || {
            name: "Unknown",
            profile_photo: null,
          },
        }));

        setPosts(merged);

      } catch (err) {
        console.error("Failed to fetch posts:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, []);

  const feedItems = useMemo(
    () => posts.map((p, idx) => <FeedItem key={p.id} post={p} index={idx} />),
    [posts]
  );

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading posts...</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-600 font-medium">No posts yet.</p>
        <p className="text-gray-400 mt-2">Start following people to see their posts!</p>
      </div>
    );
  }

  return (
    <section className="space-y-4 pb-8">
      {feedItems}
    </section>
  );
}
