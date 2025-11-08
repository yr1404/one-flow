
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="bg-card shadow-sm p-4 flex justify-between items-center">
      <h2 className="text-2xl font-semibold text-text-primary">{getPageTitle()}</h2>
      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)} 
          className="flex items-center space-x-2"
        >
          <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full" />
          <div className="text-left hidden md:block">
            <div className="font-semibold text-text-primary">{user.name}</div>
            <div className="text-sm text-text-secondary">{user.role}</div>
          </div>
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10">
            <a href="#" className="flex items-center px-4 py-2 text-sm text-text-primary hover:bg-secondary">
              <User className="w-4 h-4 mr-2" /> My Profile
            </a>
            <button onClick={logout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
