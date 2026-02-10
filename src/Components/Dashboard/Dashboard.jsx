import React, { useState } from "react";
import TopNavbar from "./TopNavbar/TopNavbar";
import LeftNavbar from "./LeftNavbar/LeftNavbar";
import StorySection from "./StorySection";
import FeedsSection from "./FeedsSection";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 overflow-hidden">
      {/* TOP NAVBAR */}
      <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-20 gap-0">
        {/* LEFT NAVBAR */}
        <LeftNavbar open={sidebarOpen} setOpen={setSidebarOpen} />

        {/* FEED SECTION (ONLY THIS SCROLLS) */}
        <main
          className="
            flex-1
            h-[calc(100vh-5rem)]
            overflow-y-auto
            bg-white
            px-2 md:px-4
            animate-fade-in
          "
        >
          <div className="max-w-5xl mx-auto py-4">
            <StorySection />
            <FeedsSection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
