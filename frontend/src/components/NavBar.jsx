import React, { useState } from "react";
import { Link, NavLink } from "react-router";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              TourApp
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLinks currentUser={currentUser} logout={logout} />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`${isOpen ? "block" : "hidden"} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <MobileNavLinks
            currentUser={currentUser}
            logout={logout}
            toggleMenu={toggleMenu}
          />
        </div>
      </div>
    </nav>
  );
};

// Reusable NavLinks component for desktop
const NavLinks = ({ currentUser, logout }) => (
  <>
    <NavLink
      to="/my-tours"
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      My Tours
    </NavLink>
    <NavLink
      to="/individual-tours"
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      Individual Tours
    </NavLink>
    <NavLink
      to="/group-tours"
      className={({ isActive }) =>
        `px-3 py-2 rounded-md text-sm font-medium ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      Group Tours
    </NavLink>

    {/* Admin Link - Only shown for admin users */}
    {currentUser?.role === "admin" && (
      <NavLink
        to="/admin"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md text-sm font-medium ${
            isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        Admin Dashboard
      </NavLink>
    )}

    {currentUser ? (
      <button
        onClick={logout}
        className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
      >
        Logout
      </button>
    ) : (
      <NavLink
        to="/login"
        className={({ isActive }) =>
          `px-3 py-2 rounded-md text-sm font-medium ${
            isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        Login
      </NavLink>
    )}
  </>
);

// Reusable MobileNavLinks component
const MobileNavLinks = ({ currentUser, logout, toggleMenu }) => (
  <>
    <NavLink
      to="/my-tours"
      onClick={toggleMenu}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      My Tours
    </NavLink>
    <NavLink
      to="/individual-tours"
      onClick={toggleMenu}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      Individual Tours
    </NavLink>
    <NavLink
      to="/group-tours"
      onClick={toggleMenu}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-md text-base font-medium ${
          isActive
            ? "bg-blue-100 text-blue-700"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      Group Tours
    </NavLink>

    {/* Admin Link - Only shown for admin users */}
    {currentUser?.role === "admin" && (
      <NavLink
        to="/admin"
        onClick={toggleMenu}
        className={({ isActive }) =>
          `block px-3 py-2 rounded-md text-base font-medium ${
            isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        Admin Dashboard
      </NavLink>
    )}

    {currentUser ? (
      <button
        onClick={() => {
          logout();
          toggleMenu();
        }}
        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
      >
        Logout
      </button>
    ) : (
      <NavLink
        to="/login"
        onClick={toggleMenu}
        className={({ isActive }) =>
          `block px-3 py-2 rounded-md text-base font-medium ${
            isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100"
          }`
        }
      >
        Login
      </NavLink>
    )}
  </>
);

export default Navbar;
