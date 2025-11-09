import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/logo.png';


const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Team Member');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(name, email, password, role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md space-y-8">
        <div className="text-center">

            <h2 className="mt-6 text-3xl font-bold tracking-tight">Create your account</h2>
            <p className="mt-2 text-sm text-brand-muted">And start managing your projects</p>
        </div>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full-name" className="sr-only">Full Name</label>
              <input
                id="full-name"
                name="name"
                type="text"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-brand-border placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-brand-border placeholder:text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">Role</label>
              <select
                id="role"
                name="role"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/80 border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-indigo/40"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option>Team Member</option>
                <option>Admin</option>
                <option>Project Manager</option>
                <option>Finance</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full btn-pill justify-center"
            >
              Create Account
            </button>
          </div>
        </form>
         <p className="text-center text-sm text-brand-muted">
            Already have an account? <a href="#/login" className="font-medium text-text-primary hover:opacity-80">Sign in</a>
          </p>
      </div>
    </div>
  );
};

export default Signup;
