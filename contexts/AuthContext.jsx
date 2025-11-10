import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

// Base API (expects VITE_API_URL to NOT include /api suffix, append manually)
const API_BASE = (typeof window !== 'undefined' && (window.__VITE_API_URL__ || import.meta?.env?.VITE_API_URL)) ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api` : 'https://3e7ae4f00f7a.ngrok-free.app/api';

function getStoredToken() { try { return localStorage.getItem('of_token'); } catch { return null; } }
function storeToken(t) { try { if (t) localStorage.setItem('of_token', t); else localStorage.removeItem('of_token'); } catch {} }

async function apiRequest(path, { method='GET', body, token } = {}) {
  const headers = { 
    'Content-Type': 'application/json', 
    'Accept': 'application/json',
    // Ensure ngrok warning page is skipped (was missing causing non-JSON HTML response)
    'ngrok-skip-browser-warning': 'true'
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method, headers, body: body? JSON.stringify(body): undefined });

  if (res.status === 204) { if (!res.ok) throw new Error('No content'); return {}; }

  const ct = res.headers.get('content-type') || '';
  // If we get HTML (ngrok interstitial) treat as error so we don't overwrite user
  if (!ct.includes('application/json')) {
    const txt = await res.text().catch(()=> '');
    throw new Error('Unexpected non-JSON response');
  }

  let data = null;
  try { data = await res.json(); } catch { data = null; }
  if (!res.ok) { const msg = (data && (data.message || data.error)) || `${res.status} ${res.statusText}`; throw new Error(msg); }
  return data ?? {};
}

const avatarFor = (name, email) => {
  const seed = name || email || 'User';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundType=gradientLinear&fontFamily=Helvetica`;
};

const prettyRole = (r) => ({ manager:'Manager', team_member:'Team Member', finance:'Finance', admin:'Admin' }[r] || r || 'User');

// Updated augmentUser: prefer DB avatar and preserve previous fields when missing in response
const augmentUser = (u, prev) => {
  if (!u || typeof u !== 'object') return prev || null;
  const nameCandidate = u.name || u.full_name || u.username || u.email || (prev && prev.name) || 'User';
  const emailCandidate = u.email || (prev && prev.email) || '';
  const avatarCandidate = u.avatar || u.avatar_url || u.image_url || prev?.avatar || null;
  return {
    id: u.id ?? prev?.id,
    name: nameCandidate,
    email: emailCandidate,
    role: prettyRole(u.role || prev?.roleRaw),
    roleRaw: u.role || prev?.roleRaw,
    hourly_rate: u.hourly_rate ?? prev?.hourly_rate ?? 0,
    // Stop using external Dicebear fallback to avoid timeouts
    avatar: avatarCandidate,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const loadMe = useCallback(async (activeToken) => {
    if (!activeToken) return;
    try {
      setLoading(true);
      const me = await apiRequest('/auth/me', { token: activeToken });
      // Merge with previous instead of overwriting
      setUser(prev => augmentUser(me, prev));
      setError(null);
    } catch (e) {
      console.warn('Failed to load /auth/me', e.message);
      // Do NOT wipe user on transient fetch/HTML error; keep previous so name doesn't revert to 'User'
      setError(e.message);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (token) {
        await loadMe(token);
      }
      if (mounted) setInitialized(true);
    })();
    return () => { mounted = false; };
  }, [token, loadMe]);

  const login = async (email, password) => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
      if (data?.token) { setToken(data.token); storeToken(data.token); }
      setUser(prev => augmentUser(data?.user ?? data, prev));
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setLoading(false); }
  };

  const signup = async (name, email, password, role='user') => {
    setLoading(true); setError(null);
    try {
      const data = await apiRequest('/auth/signup', { method: 'POST', body: { name, email, password, role } });
      if (data?.token) { setToken(data.token); storeToken(data.token); }
      setUser(prev => augmentUser(data?.user ?? data, prev));
      return true;
    } catch (e) { setError(e.message); return false; }
    finally { setLoading(false); }
  };

  const logout = () => { setUser(null); setToken(null); storeToken(null); };

  const updateAvatar = (url) => {
    setUser(prev => prev ? { ...prev, avatar: url || prev.avatar } : prev);
  };

  const value = { user, token, loading, error, initialized, login, signup, logout, updateAvatar };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
