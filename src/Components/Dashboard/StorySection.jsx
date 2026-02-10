import React, { useEffect, useState } from "react";
import { supabase } from "../../Auth/Auth";
import ProfileLogo from "../../assets/ProfileLogo.jfif";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight, faX } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

/* ---------------- STORY CARD ---------------- */
const StoryCard = ({ mediaUrl, mediaType, name, avatar, onClick, index }) => {
  return (
    <div
      onClick={onClick}
      style={{ animationDelay: `${index * 50}ms` }}
      className="relative overflow-hidden rounded-xl shadow-md cursor-pointer
      w-[90px] h-[160px] flex-shrink-0 transition-all duration-300
      hover:-translate-y-1 hover:shadow-xl animate-slide-up border border-gray-200"
    >
      {mediaType === "video" ? (
        <video
          src={mediaUrl}
          className="w-full h-full object-cover"
          muted
          autoPlay
          loop
          playsInline
        />
      ) : (
        <img
          src={mediaUrl}
          alt="story"
          className="w-full h-full object-cover"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      <div className="absolute top-2 left-2 w-8 h-8 rounded-full ring-2 ring-blue-500 overflow-hidden border-2 border-white">
        <img
          src={avatar || ProfileLogo}
          alt="profile"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-semibold truncate">
        {name}
      </div>
    </div>
  );
};

/* ---------------- MAIN COMPONENT ---------------- */
export default function Stories() {
  const [stories, setStories] = useState([]);
  const [active, setActive] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [slideDirection, setSlideDirection] = useState("right");

  /* CURRENT USER */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data?.user?.id);
    });
  }, []);

  /* FETCH STORIES */
  useEffect(() => {
    const fetchStories = async () => {
      const { data: storyData } = await supabase
        .from("story")
        .select("*")
        .order("created_at", { ascending: false });

      if (!storyData?.length) return;

      const userIds = [...new Set(storyData.map(s => s.user_id))];

      const { data: users } = await supabase
        .from("userData")
        .select("id, name, profile_photo")
        .in("id", userIds);

      const grouped = [];

      storyData.forEach(story => {
        const user = users?.find(u => u.id === story.user_id);
        const existing = grouped.find(g => g.user_id === story.user_id);

        if (existing) {
          existing.stories.push(story);
        } else {
          grouped.push({
            user_id: story.user_id,
            userData: user,
            stories: [story],
          });
        }
      });

      setStories(grouped);
    };

    fetchStories();
  }, []);

  /* DELETE STORY */
  const deleteStory = async (id) => {
    await supabase.from("story").delete().eq("id", id);
    setActive(null);
    setStories(prev =>
      prev
        .map(g => ({
          ...g,
          stories: g.stories.filter(s => s.id !== id),
        }))
        .filter(g => g.stories.length > 0)
    );
  };

  const group = active && stories[active.userIndex];
  const story = group?.stories[active.storyIndex];

  const nextStory = () => {
    setSlideDirection("left");
    if (active.storyIndex < group.stories.length - 1) {
      setActive({ ...active, storyIndex: active.storyIndex + 1 });
    } else {
      setActive(null);
    }
  };

  const prevStory = () => {
    if (active.storyIndex > 0) {
      setSlideDirection("right");
      setActive({ ...active, storyIndex: active.storyIndex - 1 });
    }
  };

  return (
    <>
      {/* STORY LIST */}
      <div className="bg-gradient-to-b from-transparent to-gray-50 rounded-2xl p-4 mb-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {stories.map((g, i) => (
            <StoryCard
              key={g.user_id}
              index={i}
              mediaUrl={g.stories[0]?.media_url}
              mediaType={g.stories[0]?.media_type}
              name={g.userData?.name}
              avatar={g.userData?.profile_photo}
              onClick={() => setActive({ userIndex: i, storyIndex: 0 })}
            />
          ))}
        </div>
      </div>

      {/* FULL SCREEN STORY */}
      {story && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
          {/* STORY MEDIA WITH ANIMATION */}
          <motion.div
            key={`${active.userIndex}-${active.storyIndex}`}
            initial={{ 
              opacity: 0, 
              x: slideDirection === "left" ? 100 : -100 
            }}
            animate={{ 
              opacity: 1, 
              x: 0 
            }}
            exit={{ 
              opacity: 0, 
              x: slideDirection === "left" ? -100 : 100 
            }}
            transition={{ 
              duration: 0.5, 
              ease: "easeInOut" 
            }}
            className="w-full h-full flex items-center justify-center"
          >
            {story.media_type === "video" ? (
              <video
                src={story.media_url}
                autoPlay             
                onEnded={nextStory}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={story.media_url}
                alt="story"
                className="w-full h-full object-contain cursor-pointer"
                onClick={nextStory}
              />
            )}
          </motion.div>

          {/* LEFT ARROW BUTTON */}
          {active.storyIndex > 0 && (
            <button
              onClick={prevStory}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-10 backdrop-blur-sm"
            >
              <FontAwesomeIcon icon={faChevronLeft} size="lg" className="text-2xl" />
            </button>
          )}

          {/* RIGHT ARROW BUTTON */}
          {active.storyIndex < group.stories.length - 1 && (
            <button
              onClick={nextStory}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-4 rounded-full transition-all duration-300 hover:scale-110 z-10 backdrop-blur-sm"
            >
              <FontAwesomeIcon icon={faChevronRight} size="lg" className="text-2xl" />
            </button>
          )}

          <div className="absolute top-6 left-6 text-white bg-black/40 rounded-xl p-4 backdrop-blur">
            <h1 className="font-semibold">{group.userData?.name}</h1>
            <p className="text-xs text-gray-300">
              {new Date(story.created_at).toLocaleTimeString()}
            </p>
          </div>

          {story.user_id === currentUserId && (
            <button
              onClick={() => deleteStory(story.id)}
              className="absolute bottom-6 right-6 bg-red-600 hover:bg-red-700 px-6 py-2 rounded-full text-white transition-all duration-200 hover:scale-105"
            >
              Delete
            </button>
          )}

          <button
            onClick={() => setActive(null)}
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all duration-300 hover:scale-110 backdrop-blur-sm"
          >
            <FontAwesomeIcon icon={faX} size="lg" className="text-xl" />
          </button>
        </div>
      )}
    </>
  );
}
