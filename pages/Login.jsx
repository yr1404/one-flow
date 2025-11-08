
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <svg className="w-16 h-16 text-primary mx-auto" viewBox="0 0 102 68" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M43.69 0L21.845 27.2727L0 0H28.2571L43.69 19.3182L59.1229 0H87.38L43.69 68L0 0H43.69Z" fill="#714B67"/><path d="M58.31 0L79.9325 27.2727L101.555 0H73.52L58.31 19.3182L43.0975 0H14.84L58.31 68L101.555 0H58.31Z" fill="#01A784"/></svg>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to OneFlow
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to continue
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
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
                className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign in
            </button>
          </div>
        </form>
         <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-opacity-80">
              Sign up
            </Link>
          </p>
      </div>
    </div>
  );
};

export default Login;
