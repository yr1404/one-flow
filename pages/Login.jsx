import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('alex.hartman@oneflow.com');
  const [password, setPassword] = useState('password123');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md space-y-8">
        <div className="text-center">
            <svg className="w-16 h-16 mx-auto" viewBox="0 0 102 68" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M43.69 0L21.845 27.2727L0 0H28.2571L43.69 19.3182L59.1229 0H87.38L43.69 68L0 0H43.69Z" fill="#714B67"/><path d="M58.31 0L79.9325 27.2727L101.555 0H73.52L58.31 19.3182L43.0975 0H14.84L58.31 68L101.555 0H58.31Z" fill="#01A784"/></svg>
            <h2 className="mt-6 text-3xl font-bold tracking-tight">Welcome to OneFlow</h2>
            <p className="mt-2 text-sm text-brand-muted">Sign in to continue</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-brand-border placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-sr" className="sr-only">Password</label>
              <input
                id="password-sr"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-brand-border placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full btn-pill justify-center"
            >
              Sign in
            </button>
          </div>
        </form>
         <p className="text-center text-sm text-brand-muted">
            Don't have an account? <a href="#/signup" className="font-medium text-text-primary hover:opacity-80">Sign up</a>
          </p>
      </div>
    </div>
  );
};

export default Login;
