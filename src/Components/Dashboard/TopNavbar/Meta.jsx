import React, { useState } from "react";
import { motion } from "framer-motion";
import TopNavbar from "../TopNavbar/TopNavbar";
import LeftNavbar from "../LeftNavbar/LeftNavbar";
import { ArrowUpRight } from "lucide-react";

const SocialSearch = () => {
  const [query, setQuery] = useState("");
  const [responses, setResponses] = useState([]);

  const handleSearch = () => {
    if (!query.trim()) return;
    // For demo, we just echo the query
    setResponses([{ id: Date.now(), text: `You searched: "${query}"` }, ...responses]);
    setQuery("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* FIXED TOP NAVBAR */}
      <TopNavbar />

      {/* PAGE CONTENT */}
      <div className="flex pt-20 h-screen">
        {/* Left Sidebar */}
        <LeftNavbar />

        {/* Main Content */}
        <main className="flex-1 flex flex-col justify-end bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 px-4 sm:px-8">
          {/* Responses Area */}
          <div className="flex-1 overflow-y-auto mb-4 mt-5 space-y-2">
            {responses.length === 0 ? (
              <div className="text-center text-gray-400 mt-20">Discuss your ideas or solved any problems with AI. Built by Muhammad Abbas for SocialLoop  <span className="text-purple-500 text-xl">∞</span>
              </div>
            ) : (
              responses.map((resp) => (
                <motion.div
                  key={resp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow p-3 max-w-md mx-auto"
                >
                  {resp.text}
                </motion.div>
              ))
            )}
          </div>

          {/* Search Input */}

          <div className="relative w-full max-w-5xl mx-auto mb-6">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Search posts, people, hashtags..."
              className="w-full rounded-3xl border border-gray-200 bg-white shadow-lg px-6 py-4 pr-16 text-base focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-transparent transition-all duration-300 placeholder-gray-400"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-transform duration-300"
            >
              <ArrowUpRight size={20} />
            </button>
          </div>



        </main>
      </div>
      </div>
    </>
  );
};

export default SocialSearch;
