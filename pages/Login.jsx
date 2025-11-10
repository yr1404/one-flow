import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import logoPng from "../assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="glass-card p-8 w-full max-w-md space-y-8">
        <div className="text-center">
          <img
            src={logoPng}
            alt="OneFlow"
            className="mx-auto w-20 h-20 object-contain rounded-md"
          />

          <h2 className="text-3xl font-bold tracking-tight">
            Welcome to OneFlow
          </h2>
          <p className="mt-2 text-sm text-brand-muted">Sign in to continue</p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
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
              <label htmlFor="password-sr" className="sr-only">
                Password
              </label>
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

          {error && <div className="text-xs text-red-600">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-pill justify-center disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-brand-muted">
          Don't have an account?{" "}
          <a
            href="#/signup"
            className="font-medium text-text-primary hover:opacity-80"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
