import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/materials', label: 'Materials' },
    { path: '/groups', label: 'Groups' },
    { path: '/posts', label: 'Posts' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur h-[70px] z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
        
        {/* Brand Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            U
          </div>
          <span className="text-lg font-bold text-gray-900">
            Uni<span className="text-blue-600">Connect</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `font-medium transition-colors ${
                  isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          
          {/* Login Button */}
          <Link 
            to="/login"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-2xl text-gray-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? '✕' : '☰'}
        </button>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="absolute top-[70px] left-0 right-0 bg-white border-b border-gray-200 md:hidden">
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded transition-colors ${
                      isActive
                        ? 'text-blue-700 bg-blue-100'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <Link 
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors text-center"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;