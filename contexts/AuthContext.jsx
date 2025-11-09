import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Base API (expects VITE_API_URL to NOT include /api suffix, append manually)
const API_BASE = (typeof window !== 'undefined' && (window.__VITE_API_URL__ || import.meta?.env?.VITE_API_URL)) ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : 'https://3e7ae4f00f7a.ngrok-free.app/api';

function getStoredToken() { try { return localStorage.getItem('of_token'); } catch { return null; } }
function storeToken(t) { try { if (t) localStorage.setItem('of_token', t); else localStorage.removeItem('of_token'); } catch {} }

async function apiRequest(path, { method='GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body? JSON.stringify(body): undefined });

  if (res.status === 204) { if (!res.ok) throw new Error('No content'); return {}; }

  const ct = res.headers.get('content-type') || '';
  let data = null;
  try {
    if (ct.includes('application/json')) data = await res.json(); else { const t = await res.text(); data = t ? { message: t } : null; }
  } catch { data = null; }
  if (!res.ok) { const msg = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`; throw new Error(msg); }
  return data ?? {};
}

const avatarFor = (name, email) => {
  const seed = name || email || 'User';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&fontFamily=Helvetica`;
};

const prettyRole = (r) => ({ manager:'Manager', team_member:'Team Member', finance:'Finance', admin:'Admin' }[r] || r || 'User');

const augmentUser = (u) => {
  if (!u || typeof u !== 'object') return null;
  return {
    id: u.id,
    name: u.name || u.email || 'User',
    email: u.email || '',
    role: prettyRole(u.role),
    roleRaw: u.role,
    hourly_rate: u.hourly_rate ?? 0,
    avatar: u.avatar || avatarFor(u.name, u.email),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadMe = useCallback(async (activeToken) => {
    if (!activeToken) return;
    try {
      setLoading(true);
      const me = await apiRequest('/auth/me', { token: activeToken });
      setUser(augmentUser(me));
      setError(null);
    } catch (e) {
      console.warn('Failed to load /auth/me', e.message);
      setUser(null);
      setError(e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (token) loadMe(token); }, [token, loadMe]);

  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
      if (data?.token) { setToken(data.token); storeToken(data.token); }
      setUser(augmentUser(data?.user));
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setLoading(false); }
  };

  const signup = async (name, email, password, role='user') => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest('/auth/signup', { method: 'POST', body: { name, email, password, role } });
      if (data?.token) { setToken(data.token); storeToken(data.token); }
      setUser(augmentUser(data?.user));
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setLoading(false); }
  };

  const logout = () => { setUser(null); setToken(null); storeToken(null); };

  const updateAvatar = (url) => {
    setUser(prev => prev ? { ...prev, avatar: url || prev.avatar } : prev);
  };

  const value = { user, token, loading, error, login, signup, logout, updateAvatar };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
