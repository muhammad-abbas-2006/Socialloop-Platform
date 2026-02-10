import React, { useEffect, useRef, useState } from "react";
import TopNavbar from "../TopNavbar/TopNavbar";
import LeftNavbar from "../LeftNavbar/LeftNavbar";
import { supabase } from "../../../Auth/Auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faVolumeXmark,
  faVolumeHigh,
  faThumbsUp,
  faShare,
  faComment,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";

const VideoCard = ({ video }) => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play();
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) observer.observe(videoRef.current);

    return () => {
      if (videoRef.current) observer.unobserve(videoRef.current);
    };
  }, []);

  const handleLike = () => {
    setLikes(likes + 1);
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      setComments([...comments, commentText]);
      setCommentText("");
    }
  };

  const handleShare = async () => {
    try {
      const videoUrl = `${window.location.origin}?video=${video.id}`;
      await navigator.clipboard.writeText(videoUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl mb-6 overflow-hidden border border-gray-100 transition-all duration-300 hover-lift animate-slide-up">
      <video
        ref={videoRef}
        src={video.media_url}
        muted={muted}
        loop
        controls
        className="w-full max-h-[500px] bg-black object-cover"
      />

      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100">
        <button
          onClick={() => setMuted(!muted)}
          className="text-sm text-gray-600 flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-200 icon-hover group font-medium"
        >
          {muted ? (
            <>
              <FontAwesomeIcon icon={faVolumeXmark} className="text-red-500 group-hover:scale-110 transition-transform" />
              Muted
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faVolumeHigh} className="text-green-500 group-hover:scale-110 transition-transform" />
              Sound
            </>
          )}
        </button>
      </div>

      {video.caption && (
        <p className="px-6 text-sm text-gray-800 py-3 border-b border-gray-100">
          {video.caption}
        </p>
      )}

      <div className="flex justify-around py-3 text-gray-600 px-2">
        <button onClick={handleLike} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium icon-hover group flex-1 justify-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
            <FontAwesomeIcon icon={faThumbsUp} className="group-hover:scale-110 transition-transform" />
          </span>
          <span>{likes > 0 ? likes : 'Like'}</span>
        </button>
        <button onClick={() => setIsCommentOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 font-medium icon-hover group flex-1 justify-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
            <FontAwesomeIcon icon={faComment} className="group-hover:scale-110 transition-transform" />
          </span>
          <span>{comments.length > 0 ? comments.length : 'Comment'}</span>
        </button>
        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-medium icon-hover group flex-1 justify-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
            <FontAwesomeIcon icon={faShare} className="group-hover:scale-110 transition-transform" />
          </span>
          <span>Share</span>
        </button>
      </div>

      {/* COMMENT MODAL */}
      <AnimatePresence>
        {isCommentOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
            onClick={() => setIsCommentOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[500px] overflow-hidden flex flex-col"
            >
              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Comments ({comments.length})</h2>
                <button
                  onClick={() => setIsCommentOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <FontAwesomeIcon icon={faX} className="text-gray-600" />
                </button>
              </div>

              {/* COMMENTS LIST */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {comments.length > 0 ? (
                  comments.map((comment, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-800">{comment}</p>
                      <p className="text-xs text-gray-500 mt-1">Just now</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-6">No comments yet. Be the first!</p>
                )}
              </div>

              {/* INPUT AREA */}
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
                    placeholder="Add a comment..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-medium text-sm"
                  >
                    Post
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SHARE TOAST */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          >
            ✓ Link copied to clipboard!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Videos = () => {
  const [videos, setVideos] = useState([]);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("media_type", "video")
        .order("created_at", { ascending: false });

      if (!error) setVideos(data);
    };

    fetchVideos();
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <TopNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        <div className="flex pt-20 min-h-screen lg:h-screen lg:overflow-hidden">
          {/* LEFT SIDEBAR (mobile + desktop both) */}
          <LeftNavbar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

          {/* MAIN CONTENT */}
          <main className="flex-1 bg-white lg:overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              <h1 className="text-3xl font-bold mb-8 text-gray-900">📹 Watch Videos</h1>

              {videos.length > 0 ? (
                videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-600 text-lg">No videos available</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Videos;
