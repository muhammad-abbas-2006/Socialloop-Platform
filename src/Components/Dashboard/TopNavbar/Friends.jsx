import React, { useEffect, useState } from "react";
import TopNavbar from "../TopNavbar/TopNavbar";
import LeftNavbar from "../LeftNavbar/LeftNavbar";
import image from "../../../assets/ProfileLogo.jfif";
import { supabase } from "../../../Auth/Auth";

const FriendCard = ({ name, email, image }) => {
  return (
    <div className="relative bg-white rounded-xl shadow-sm p-6 text-center hover:shadow-md transition">
      <div className="flex justify-center">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 rounded-full object-cover"
        />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-gray-900">
        {name}
      </h3>

      <p className="text-sm text-gray-500">{email}</p>

      <div className="mt-6 flex justify-center gap-3">
        <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          Add Friend
        </button>

        <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
          Message
        </button>
      </div>
    </div>
  );
};

const Friends = () => {
  const [userData, setUserData] = useState([]);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("userData")
        .select("*");

      if (data) setUserData(data);
      else console.log(error);
    };

    fetchData();
  }, []);

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* FIXED TOP NAVBAR */}
   <TopNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

      {/* FULL HEIGHT LAYOUT */}
      <div className="flex pt-20 h-screen overflow-hidden">
        
        {/* STICKY LEFT SIDEBAR */}
           <LeftNavbar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

        {/* SCROLLABLE CONTENT ONLY */}
        <main className="flex-1 bg-gray-50 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              People you may know
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userData.map((user) => (
                <FriendCard
                  key={user.id}
                  name={user.name}
                  email={user.email}
                  image={user.profile_photo || image}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
      </div>
    </>
  );
};

export default Friends;
