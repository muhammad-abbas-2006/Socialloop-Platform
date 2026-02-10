import { useEffect, useState } from "react";
import {
  HomeIcon,
  UsersIcon,
  PlayCircleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { NavLink } from "react-router-dom";
import { supabase } from "../../../Auth/Auth";
import ProfileLogo from "../../../assets/ProfileLogo.jfif";
import logo from "../../../assets/socialloop-logo.jpg";

const LeftNavbar = ({ open, setOpen }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data } = await supabase
        .from("userData")
        .select("*")
        .eq("id", user.id)
        .single();

      setUserData(data);
    };

    fetchUserData();
  }, []);

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static z-50 top-16 
          h-[calc(100vh-4rem)]
          w-72
          bg-white
          border border-gray-200
          rounded-2xl
          shadow-lg
          px-5 py-6
          flex flex-col justify-between
          transition-all duration-300 ease-out
          ${open ? "translate-x-0 opacity-100" : "-translate-x-full opacity-0"}
          md:translate-x-0 md:opacity-100
          animate-slide-in-left
        `}
      >
        {/* LOGO */}
        <div className="animate-fade-in">
          <div className=" rounded-2xl p-4 mb-6 flex items-center justify-center hover-lift border border-blue-200">
            <img src={logo} alt="SocialLoop Logo" className="w-100 h-15" />
          </div>

          {/* MENU */}
          <nav className="space-y-2">
            <SidebarItem 
              to="/dashboard" 
              icon={HomeIcon} 
              label="Home" 
              delay="0"
            />
            <SidebarItem 
              to="/friends" 
              icon={UsersIcon} 
              label="Friends" 
              delay="50"
            />
            <SidebarItem
              to="/videos"
              icon={PlayCircleIcon}
              label="Videos"
              badge="12"
              delay="100"
            />
            <SidebarItem
              to="/messanger"
              icon={ChatBubbleLeftRightIcon}
              label="Messenger"
              delay="150"
            />
            <SidebarItem
              to="/meta"
              icon={ChatBubbleLeftRightIcon}
              label="AI Chat"
              delay="200"
            />
          
          </nav>

          {/* DIVIDER */}
          <div className="my-4 border-b border-gray-200"></div>

          {/* QUICK ACTIONS */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 px-4 py-2">MORE</div>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 icon-hover group">
              <BellIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Notifications</span>
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse-custom">3</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 icon-hover group">
              <Cog6ToothIcon className="w-5 h-5 group-hover:scale-110 transition-transform group-hover:rotate-90 duration-300" />
              <span className="text-sm font-medium">Settings</span>
            </button>
          </div>

          {/* LOGOUT */}
          <div className="mt-4">
            <NavLink
              to="/logout"
              className="flex items-center gap-3 px-4 py-3 rounded-xl
              text-red-500 hover:bg-red-50 transition-all duration-200 hover-lift group icon-hover"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium">Logout</span>
            </NavLink>
          </div>
        </div>

        {/* USER CARD */}
        <NavLink to="/userprofile">
          <div className="flex items-center gap-3 p-4 rounded-2xl
            bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50
            hover:from-blue-100 hover:via-purple-100 hover:to-pink-100 
            transition-all duration-300 hover-lift border border-blue-200 cursor-pointer group">
            <img
              src={userData?.profile_photo || ProfileLogo}
              className="w-12 h-12 rounded-full border-2 border-blue-300 object-cover group-hover:border-blue-500 transition-all"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition">
                {userData?.name || "User Name"}
              </p>
              <p className="text-xs text-gray-400 group-hover:text-blue-500 transition">View profile</p>
            </div>
            <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </NavLink>
      </aside>
    </>
  );
};

export default LeftNavbar;

/* -------- SIDEBAR ITEM -------- */

const SidebarItem = ({ to, icon: Icon, label, badge, delay }) => {
  return (
    <NavLink
      to={to}
      style={{ animationDelay: `${delay}ms` }}
      className={({ isActive }) =>
        `flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200
        ${
          isActive
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover-lift"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600 icon-hover"
        }`
      }
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
        <span className="text-sm font-medium">{label}</span>
      </div>

      {badge && (
        <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse-custom">
          {badge}
        </span>
      )}
    </NavLink>
  );
};
