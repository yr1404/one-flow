import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { ChevronDown, User, LogOut, Search, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import logoUrl from '../assets/logo.svg';

const Header = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="hidden md:block sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-brand-border/80">
      <div className="px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {/* <img src={logoUrl} alt="OneFlow" className="h-8 w-8 rounded-md object-contain" /> */}
          <h2 className="text-lg font-semibold tracking-tight truncate">{getPageTitle()}</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center relative">
            {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" /> */}
            {/* <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 rounded-pill bg-brand-bg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40 text-sm placeholder:text-brand-muted" /> */}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex items-center gap-3 px-2 py-1.5 rounded-pill hover:bg-brand-bg/80 transition"
            >
              <img src={user.avatar} alt="User Avatar" className="w-10 h-10 rounded-full ring-2 ring-white shadow-innerGlow object-cover" />
              <div className="text-left hidden md:block">
                <div className="font-medium leading-tight">{user.name}</div>
                <div className="text-xs text-brand-muted">{user.role}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-brand-muted" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-xl shadow-elevated border border-brand-border/60 py-2 z-10 animate-fade-in">
                <button onClick={() => { setProfileOpen(true); setDropdownOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-brand-bg">
                  <User className="w-4 h-4 mr-2" /> My Profile
                </button>
                <button onClick={logout} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl">
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {profileOpen && createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setProfileOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-elevated overflow-hidden">
            <button onClick={() => setProfileOpen(false)} className="absolute top-3 right-3 text-brand-muted hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
            <div className="max-h-[90vh] overflow-y-auto p-6">
              <h3 className="text-lg font-semibold mb-4">My Profile</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-brand-muted">Full Name</label>
                  <input defaultValue={user.name} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
                <div>
                  <label className="text-xs text-brand-muted">Email</label>
                  <input defaultValue={user.email} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
                <div>
                  <label className="text-xs text-brand-muted">New Password</label>
                  <input type="password" placeholder="••••••••" className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
                <div>
                  <label className="text-xs text-brand-muted">Confirm Password</label>
                  <input type="password" placeholder="••••••••" className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button onClick={() => setProfileOpen(false)} className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">Cancel</button>
                <button onClick={() => { /* TODO: persist changes */ setProfileOpen(false); }} className="btn-pill">Save Changes</button>
              </div>
            </div>
          </div>
        </div>, document.body)
      }
    </header>
  );
};

export default Header;
