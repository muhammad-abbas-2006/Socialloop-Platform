import React, { useState, useEffect, useRef } from "react";
import TopNavbar from "../TopNavbar/TopNavbar";
import LeftNavbar from "../LeftNavbar/LeftNavbar";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PaperClipIcon,
  FaceSmileIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../../../Auth/Auth";
import ProfileLogo from "../../../assets/ProfileLogo.jfif";

const Messanger = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState([
    { id: 1, name: "John Doe", avatar: ProfileLogo, lastMessage: "Hey! How are you?", time: "2m", unread: 2, status: "online" },
    { id: 2, name: "Sarah Smith", avatar: ProfileLogo, lastMessage: "See you tonight!", time: "1h", unread: 0, status: "online" },
    { id: 3, name: "Mike Johnson", avatar: ProfileLogo, lastMessage: "Thanks for the update", time: "3h", unread: 0, status: "offline" },
    { id: 4, name: "Emma Wilson", avatar: ProfileLogo, lastMessage: "Let's catch up soon", time: "1d", unread: 0, status: "online" },
    { id: 5, name: "Alex Brown", avatar: ProfileLogo, lastMessage: "Perfect! See you then", time: "2d", unread: 0, status: "offline" },
  ]);

  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messages, setMessages] = useState([
    { id: 1, sender: "John Doe", text: "Hey! How are you?", time: "10:30 AM", isSent: false, avatar: ProfileLogo },
    { id: 2, sender: "You", text: "I'm doing great! How about you?", time: "10:31 AM", isSent: true },
    { id: 3, sender: "John Doe", text: "Same here! Let's catch up sometime", time: "10:32 AM", isSent: false, avatar: ProfileLogo },
    { id: 4, sender: "You", text: "Absolutely! Free this weekend?", time: "10:33 AM", isSent: true },
  ]);

  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: messages.length + 1,
        sender: "You",
        text: messageInput,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        isSent: true,
      };
      setMessages([...messages, newMessage]);
      setMessageInput("");

      // Simulate reply after 1s
      setTimeout(() => {
        const reply = {
          id: messages.length + 2,
          sender: selectedConversation.name,
          text: "That's awesome! 😊",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isSent: false,
          avatar: selectedConversation.avatar,
        };
        setMessages((prev) => [...prev, reply]);
      }, 1000);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="min-h-screen bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        {/* FIXED TOP NAVBAR */}
        <TopNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <div className="flex pt-20 gap-0 h-[calc(100vh-5rem)]">
          {/* Left Sidebar */}
          <LeftNavbar open={isSidebarOpen} setOpen={setIsSidebarOpen} />

          {/* Main Content - SINGLE CONTAINER */}
          <main className="flex-1 flex flex-col rounded-2xl m-4 bg-white border border-gray-200 shadow-lg overflow-hidden">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedConversation.avatar}
                    alt={selectedConversation.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white"
                  />
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    selectedConversation.status === "online" ? "bg-green-400" : "bg-gray-400"
                  }`} />
                </div>
                <div>
                  <h2 className="font-bold text-lg">{selectedConversation.name}</h2>
                  <p className="text-xs text-blue-100">
                    {selectedConversation.status === "online" ? "Active now" : "Active 2h ago"}
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 icon-hover">
                <EllipsisVerticalIcon className="w-6 h-6" />
              </button>
            </div>

            {/* CONVERSATION LIST & MESSAGES AREA */}
            <div className="flex flex-1 overflow-hidden">
              {/* CONVERSATIONS SIDEBAR - HIDDEN ON MOBILE */}
              <div className="hidden md:flex md:w-80 flex-col border-r border-gray-200 overflow-hidden">
                {/* SEARCH */}
                <div className="bg-gray-50 p-4 border-b border-gray-200">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-full bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 border border-gray-200"
                    />
                  </div>
                </div>

                {/* CONVERSATIONS LIST */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.map((conv, idx) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      style={{ animationDelay: `${idx * 50}ms` }}
                      className={`
                        flex items-center gap-3 p-4 cursor-pointer border-b border-gray-100
                        transition-all duration-200 hover-lift
                        ${selectedConversation.id === conv.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "hover:bg-gray-50"
                        }
                      `}
                    >
                      {/* AVATAR */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={conv.avatar}
                          alt={conv.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                        />
                        {/* STATUS DOT */}
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                            conv.status === "online" ? "bg-green-500" : "bg-gray-400"
                          }`}
                        />
                      </div>

                      {/* INFO */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conv.name}
                          </h3>
                          <span className="text-xs text-gray-400 ml-2">{conv.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>

                      {/* UNREAD BADGE */}
                      {conv.unread > 0 && (
                        <div className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse-custom">
                          {conv.unread}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CHAT AREA */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 flex flex-col">
                  {messages.map((msg, idx) => (
                    <div
                      key={msg.id}
                      style={{ animationDelay: `${idx * 100}ms` }}
                      className={`flex gap-2 animate-slide-up ${
                        msg.isSent ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!msg.isSent && (
                        <img
                          src={msg.avatar}
                          alt={msg.sender}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div
                        className={`max-w-xs px-4 py-2 rounded-2xl transition-all duration-200 ${
                          msg.isSent
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-lg"
                            : "bg-gray-200 text-gray-900 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.isSent ? "text-blue-100" : "text-gray-500"}`}>
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT AREA */}
                <div className="border-t border-gray-200 bg-white p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-blue-50 transition-all duration-200 text-blue-600 hover-lift icon-hover group">
                      <PaperClipIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <input
                      type="text"
                      placeholder="Aa"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 px-4 py-2 rounded-full bg-gray-100 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 placeholder-gray-500"
                    />
                    <button className="p-2 rounded-full hover:bg-blue-50 transition-all duration-200 text-blue-600 hover-lift icon-hover group">
                      <FaceSmileIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all duration-200 hover-lift"
                    >
                      <PaperAirplaneIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Messanger;
