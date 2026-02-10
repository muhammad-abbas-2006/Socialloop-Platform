import { useEffect, useState } from 'react';
import TopNavbar from '../TopNavbar/TopNavbar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp, faTrash, faEllipsis, faCamera, faComment, faShare, faX } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '../../../Auth/Auth';
import ProfileLogo from '../../../assets/ProfileLogo.jfif';
import CoverPhoto from '../../../assets/CoverPhoto.jpg';
import { motion, AnimatePresence } from "framer-motion";
import camera from '../../../assets/camera.svg'
const UserProfile = () => {
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [storyFiles, setStoryFiles] = useState([]);
  const [likePost, setLikePost] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ALWAYS CLOSED BY DEFAULT
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isPosting, setIsPosting] = useState(false);
  const [postDelete, setPostDelete] = useState(null);
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [isPostingMedia, setIsPostingMedia] = useState(false);
  const [isPostingStory, setIsPostingStory] = useState(false);
  const [commentStates, setCommentStates] = useState({});
  const [showShareToast, setShowShareToast] = useState(false);

  // Fetch current user and userData
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) return console.error("Auth Error:", userError.message);

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("userData")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) console.error("Fetch UserData Error:", error.message);
      else {
        setUserData(data);
        setProfilePhoto(data?.profile_photo || null);
        setCoverPhoto(data?.cover_photo || null);
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  // Fetch user posts
  useEffect(() => {
    if (!userData) return;

    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", userData.id)
        .order("created_at", { ascending: false });

      if (error) console.error("Fetch Posts Error:", error.message);
      else {
        const files = data.map(post => ({
          url: post.media_url,
          type: post.media_type,
          name: "media",
          id: post.id,
          created_at: post.created_at,
        }));
        setMediaFiles(files);
        setLikePost(files.map(() => 0));
      }
    };

    fetchPosts();
  }, [userData]);

  // Upload file to Supabase Storage
  const uploadToSupabase = async (file) => {
    if (!userData) return null;

    try {
      const filePath = `user_${userData.id}/${Date.now()}_${file.name}`;

      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("PhotoAndVideo")
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) {
        console.error("❌ STORAGE UPLOAD ERROR:", uploadError.message);
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("PhotoAndVideo")
        .getPublicUrl(filePath);

      return {
        url: publicUrlData.publicUrl,
        type: file.type.startsWith("video") ? "video" : "image",
        name: file.name,
      };
    } catch (err) {
      console.error("❌ UPLOAD ERROR:", err.message);
      return null;
    }
  };

  // Handle media upload
  const handleMediaUpload = async (e) => {
    if (!userData) return;
    setIsPostingMedia(true);

    const files = Array.from(e.target.files);
    for (let file of files) {
      const uploaded = await uploadToSupabase(file);
      if (!uploaded) continue;

      const { error } = await supabase.from("posts").insert({
        user_id: userData.id,
        media_url: uploaded.url,
        media_type: uploaded.type,
      });

      if (!error) setMediaFiles(prev => [uploaded, ...prev]);
    }

    setIsPostingMedia(false);
    e.target.value = "";
  };


  const handleStoryUpload = async (e) => {
    if (!userData) return;
    setIsPostingStory(true);

    const files = Array.from(e.target.files);
    for (let file of files) {
      const uploaded = await uploadToSupabase(file);
      if (!uploaded) continue;

      const { error } = await supabase.from("story").insert({
        user_id: userData.id,
        media_url: uploaded.url,
        media_type: uploaded.type,
      });

      if (!error) setStoryFiles(prev => [uploaded, ...prev]);
      else console.error("Story insert error:", error.message);
    }

    setIsPostingStory(false);
    e.target.value = "";
  };


  // Handle delete post
  const handleDeletePost = async (index) => {
    const file = mediaFiles[index];
    if (!file) return;
    setPostDelete(index);

    // Storage delete
    const filePath = file.url.split("/PhotoAndVideo/")[1];
    const { error: storageError } = await supabase.storage
      .from("PhotoAndVideo")
      .remove([filePath]);

    if (storageError) console.error("Storage Delete Error:", storageError.message);

    // DB delete
    const { error: dbError } = await supabase
      .from("posts")
      .delete()
      .eq("media_url", file.url);

    if (dbError) console.error("DB Delete Error:", dbError.message);

    // UI update
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setLikePost(prev => prev.filter((_, i) => i !== index));
    setPostDelete(null);
  };

  // Like post
  const handleLikePost = (index) => {
    setLikePost(prev => prev.map((count, i) => (i === index ? count + 1 : count)));
  };

  // Open comments modal
  const handleOpenComments = (index) => {
    setCommentStates(prev => ({
      ...prev,
      [index]: { ...prev[index], isOpen: true }
    }));
  };

  // Add comment to post
  const handleAddComment = (index) => {
    const state = commentStates[index] || {};
    if (state.text?.trim()) {
      setCommentStates(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          comments: [...(prev[index]?.comments || []), state.text],
          text: ""
        }
      }));
    }
  };

  // Share post
  const handleSharePost = async (index) => {
    try {
      const postUrl = `${window.location.origin}?post=${mediaFiles[index]?.id}`;
      await navigator.clipboard.writeText(postUrl);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Change cover photo
  const changeCover = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploaded = await uploadToSupabase(file);
    if (!uploaded) return;

    // Update DB
    const { error } = await supabase
      .from("userData")
      .update({ cover_photo: uploaded.url })
      .eq("id", userData.id);

    if (error) console.error("Cover Update Error:", error.message);
    else setCoverPhoto(uploaded.url);
  };

  // Change profile photo
  const changeProfile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploaded = await uploadToSupabase(file);
    if (!uploaded) return;

    // Update DB
    const { error } = await supabase
      .from("userData")
      .update({ profile_photo: uploaded.url })
      .eq("id", userData.id);

    if (error) console.error("Profile Update Error:", error.message);
    else setProfilePhoto(uploaded.url);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
      <TopNavbar
        onToggleSidebar={() => {
          if (isMobile) setIsSidebarOpen(prev => !prev); // Only on mobile
        }}
      />


      <main className="pt-16 flex-1">

        {/* Cover Photo */}
        <div className="relative h-52 sm:h-64 md:h-80 bg-gray-300">
          <div
            className="absolute inset-0 cursor-default"
            style={{
              backgroundImage: `url(${coverPhoto || CoverPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}

            onClick={() => coverPhoto && setPreviewImage(coverPhoto ? coverPhoto : CoverPhoto)}
          />
          <label className="absolute right-4 bottom-4 z-10 bg-white px-3 py-1 rounded shadow text-sm active:scale-95 cursor-pointer select-none">
            Edit Photo
            <input type="file" accept="image/*" className="hidden" onChange={changeCover} />
          </label>
        </div>

        {/* Profile Section */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative -mt-16 sm:-mt-20 flex justify-center sm:justify-start">
            <div className="relative">
              <img
                src={profilePhoto || ProfileLogo}
                className="h-40 w-40 rounded-full border-4 border-white object-cover bg-gray-200 cursor-pointer"
                onClick={() => setPreviewImage(profilePhoto || ProfileLogo)}
              />
              <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow cursor-pointer select-none">
                <FontAwesomeIcon icon={faCamera} style={{ color: "#74C0FC", }} />
                <input type="file" accept="image/*" className="hidden" onChange={changeProfile} />
              </label>
            </div>
          </div>

          <div className="mt-4 text-center flex flex-col sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div>
              <h1 className="text-2xl font-bold">{userData?.name || "Name..."}</h1>
              <p className="text-gray-600 text-sm">{userData?.email || "Email..."}</p>
            </div>

            <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
              {/* Story Button */}
              <label
                htmlFor="addStory"
                className={`bg-blue-500 px-4 py-2 rounded-3xl text-white font-medium mt-2 select-none
    ${isPostingStory ? "bg-gray-400 cursor-not-allowed" : "cursor-pointer active:scale-95"}`}
              >
                {isPostingStory ? "Posting..." : "+ Add Story"}
              </label>
              <input
                id="addStory"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleStoryUpload}
                disabled={isPostingStory}
              />


              {/* Media/Post Button */}
              <label
                htmlFor="addMedia"
                className={`px-4 py-2 rounded-3xl text-white font-medium mt-2 select-none
    ${isPostingMedia ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 cursor-pointer active:scale-95"}`}
              >
                {isPostingMedia ? "Posting..." : "Photo / Video"}
              </label>
              <input
                id="addMedia"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                disabled={isPostingMedia}
                onChange={handleMediaUpload}
              />


            </div>
          </div>

          {/* Uploaded Story */}

          {isPostingStory && (
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">
                Posting Story ...
              </p>
            </div>
          )}

          {/* Uploaded Media */}

          {isPostingMedia && (
            <div className="mt-6 w-full flex justify-center px-3">
              <div
                className="
        w-full 
        sm:max-w-xl 
        md:max-w-2xl 
        lg:max-w-3xl
        bg-white 
        dark:bg-neutral-900 
        rounded-2xl 
        shadow-lg 
        p-5 
        animate-pulse
      "
              >
                {/* Header */}
                <div className="flex items-center gap-4">
                  {/* Avatar Skeleton */}
                  <div className="w-14 h-14 rounded-full bg-gray-300 dark:bg-neutral-700"></div>

                  {/* Name + time */}
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-gray-300 dark:bg-neutral-700 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 dark:bg-neutral-800 rounded"></div>
                  </div>
                </div>

                {/* Content Skeleton */}
                <div className="mt-5 space-y-3">
                  <div className="h-4 w-full bg-gray-300 dark:bg-neutral-700 rounded"></div>
                  <div className="h-4 w-11/12 bg-gray-300 dark:bg-neutral-700 rounded"></div>
                  <div className="h-4 w-4/5 bg-gray-300 dark:bg-neutral-700 rounded"></div>
                </div>

                {/* Media Placeholder */}
                <div className="
        mt-6 
        h-64 
        sm:h-72 
        md:h-80 
        lg:h-96
        w-full 
        bg-gray-200 
        dark:bg-neutral-800 
        rounded-xl 
        flex 
        items-center 
        justify-center
      ">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>

                {/* Footer */}
                <p className="mt-5 text-center text-sm font-semibold text-gray-500">
                  Posting your media...
                </p>
              </div>
            </div>
          )}



          {!isPostingMedia && mediaFiles.length > 0 && (
            <div id="post" className="mt-6 flex flex-col gap-8">
              {/* existing post cards */}
            </div>
          )}


          {mediaFiles.length > 0 && (
            <div id="post" className="mt-6 flex flex-col gap-6 pb-10">
              {mediaFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-3xl shadow-md hover:shadow-xl overflow-hidden 
        w-full max-w-2xl mx-auto border border-gray-100 relative transition-all duration-300 hover-lift"
                >
                  {/* HEADER */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <img
                        src={profilePhoto || ProfileLogo}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{userData?.name || "User"}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(file.created_at || Date.now()).toLocaleDateString([], {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </p>
                      </div>
                    </div>

                    {/* 3-DOT MENU */}
                    <div className="relative">
                      <button
                        className="p-2 rounded-full hover:bg-gray-100 transition-all duration-200 text-gray-600 icon-hover group"
                        onClick={() =>
                          setOpenDropdownIndex(openDropdownIndex === index ? null : index)
                        }
                      >
                        <FontAwesomeIcon icon={faEllipsis} className="group-hover:scale-110 transition-transform" />
                      </button>

                      {openDropdownIndex === index && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-2xl shadow-lg z-20 overflow-hidden animate-slide-up">

                          {/* Delete Post */}
                          <button
                            onClick={() => handleDeletePost(index)}
                            disabled={postDelete === index}
                            className={`flex items-center gap-2 w-full px-4 py-3 text-left font-medium transition-all duration-200
          ${postDelete === index ? "cursor-not-allowed text-gray-400 bg-gray-50" : "hover:bg-red-50 hover:text-red-600 text-gray-700"}
        `}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            {postDelete === index ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MEDIA */}
                  <div className="bg-black/5 overflow-hidden relative group">
                    {file.type === "image" ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-auto max-h-[500px] object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <video
                        src={file.url}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto max-h-[500px] object-cover"
                      />
                    )}
                    
                    {/* PLAY ICON FOR VIDEO */}
                    {file.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-blue-500 rounded-full p-4 text-white text-2xl">
                          ▶
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FOOTER - LIKE & STATS */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLikePost(index)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium icon-hover group flex-1 justify-center text-gray-600"
                        >
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                            <FontAwesomeIcon icon={faThumbsUp} className="text-blue-600 group-hover:scale-110 transition-transform" />
                          </span>
                          <span className="text-sm">{likePost[index] || 'Like'}</span>
                        </button>
                        <button onClick={() => handleOpenComments(index)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-all duration-200 font-medium icon-hover group flex-1 justify-center text-gray-600">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 group-hover:bg-gray-300 transition-colors">
                            <FontAwesomeIcon icon={faComment} className="text-gray-600 group-hover:scale-110 transition-transform" />
                          </span>
                          <span className="text-sm">{commentStates[index]?.comments?.length || 'Comment'}</span>
                        </button>
                        <button onClick={() => handleSharePost(index)} className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-green-50 hover:text-green-600 transition-all duration-200 font-medium icon-hover group flex-1 justify-center text-gray-600">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                            <FontAwesomeIcon icon={faShare} className="text-green-600 group-hover:scale-110 transition-transform" />
                          </span>
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(file.created_at || Date.now()).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>

                    {/* LIKE BAR */}
                    <div className="text-xs text-gray-600 pb-3 border-b border-gray-100">
                      {likePost[index] > 0 && (
                        <span className="font-medium">👍 {likePost[index]} {likePost[index] === 1 ? 'person' : 'people'} liked this</span>
                      )}
                    </div>
                  </div>

                  {/* COMMENT MODAL */}
                  <AnimatePresence>
                    {commentStates[index]?.isOpen && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
                        onClick={() => setCommentStates(prev => ({ ...prev, [index]: { ...prev[index], isOpen: false } }))}
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
                            <h2 className="text-lg font-bold text-gray-900">Comments ({commentStates[index]?.comments?.length || 0})</h2>
                            <button
                              onClick={() => setCommentStates(prev => ({ ...prev, [index]: { ...prev[index], isOpen: false } }))}
                              className="p-2 hover:bg-gray-100 rounded-full transition-all"
                            >
                              <FontAwesomeIcon icon={faX} className="text-gray-600" />
                            </button>
                          </div>

                          {/* COMMENTS LIST */}
                          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                            {commentStates[index]?.comments?.length > 0 ? (
                              commentStates[index].comments.map((comment, cIdx) => (
                                <div key={cIdx} className="bg-gray-50 rounded-lg p-3">
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
                                value={commentStates[index]?.text || ""}
                                onChange={(e) => setCommentStates(prev => ({ ...prev, [index]: { ...prev[index], text: e.target.value } }))}
                                onKeyPress={(e) => e.key === "Enter" && handleAddComment(index)}
                                placeholder="Add a comment..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              />
                              <button
                                onClick={() => handleAddComment(index)}
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
                </motion.div>
              ))}
            </div>
          )}

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

      </main>

      {/* Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} className="max-w-[95vw] max-h-[90vh] rounded" />
        </div>
      )}
    </div>
  );
};

export default UserProfile;
