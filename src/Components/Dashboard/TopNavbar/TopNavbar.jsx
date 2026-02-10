import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faHouse,
  faUserGroup,
  faVideo,
  faArrowRightFromBracket,
} from '@fortawesome/free-solid-svg-icons'
import {
  faFacebookMessenger,
  faMeta,
} from '@fortawesome/free-brands-svg-icons'
import { Bars3Icon } from '@heroicons/react/24/outline'
import { NavLink } from 'react-router-dom'

const TopNavbar = ({ onToggleSidebar }) => {
  const navItems = [
    { id: 'home', icon: faHouse, label: 'Home', path: '/dashboard' },
    { id: 'groups', icon: faUserGroup, label: 'Friends', path: '/friends' },
    { id: 'video', icon: faVideo, label: 'Videos', path: '/videos' },
    { id: 'messenger', icon: faFacebookMessenger, label: 'Messenger', path: '/messanger' },
    { id: 'ai', icon: faMeta, label: 'Meta', path: '/meta' },
    { id: 'logout', icon: faArrowRightFromBracket, label: 'Logout', path: '/login' },
  ]

  return (
    <nav className="fixed top-0 left-0 w-full z-50 animate-slide-in-down">
      <div className="h-16 flex items-center justify-center py-2">
        {/* NAVBAR BOX */}
        <div
          className="
            bg-white 
            rounded-2xl shadow-lg border border-gray-200
            h-14 flex items-center justify-center
            w-[95vw] sm:w-[90vw] md:w-[75vw] lg:w-[60vw]
            max-w-[1100px]
            px-4 relative
            transition-all duration-300 hover:shadow-xl
          "
        >
          {/* MOBILE TOGGLE */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden absolute left-2 p-2 rounded-lg hover:bg-blue-50 transition-all duration-200 hover-lift icon-hover group"
          >
            <Bars3Icon className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
          </button>

          {/* CENTER ICONS */}
          <div className="flex gap-6 sm:gap-20 items-center">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `relative group transition-all duration-300 ${
                    isActive
                      ? 'text-blue-600 scale-110'
                      : 'text-gray-500 hover:text-blue-500'
                  }`
                }
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* ACTIVE BACKGROUND */}
                {({ isActive }) =>
                  isActive && (
                    <span className="absolute inset-0 rounded-full bg-blue-100 scale-150 -z-10 animate-glow"></span>
                  )
                }

                <FontAwesomeIcon
                  icon={item.icon}
                  className="relative z-10 text-[22px] transition-all duration-200 group-hover:scale-110 icon-hover"
                />

                {/* TOOLTIP */}
                <span
                  className="
                    absolute -bottom-10 left-1/2 -translate-x-1/2
                    bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs px-3 py-1.5 rounded-lg
                    opacity-0 group-hover:opacity-100 transition-all duration-200
                    hidden sm:block
                    shadow-lg
                  "
                >
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopNavbar
