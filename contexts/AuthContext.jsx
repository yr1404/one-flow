
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Simulate a logged-in user. In a real app, this would be null initially.
  const [user, setUser] = useState({ 
    name: 'Alex Hartman', 
    email: 'alex.hartman@oneflow.com',
    role: 'Project Manager',
    avatar: 'https://picsum.photos/seed/alex/100/100'
  });

  const login = (email, password) => {
    // In a real app, you'd make an API call here.
    console.log('Logging in with', email, password);
    setUser({ 
      name: 'Alex Hartman', 
      email: 'alex.hartman@oneflow.com',
      role: 'Project Manager',
      avatar: 'https://picsum.photos/seed/alex/100/100'
    });
  };

  const logout = () => {
    setUser(null);
  };
  
  const signup = (name, email, password) => {
    console.log('Signing up with', name, email, password);
    setUser({
        name,
        email,
        role: 'Project Manager',
        avatar: `https://picsum.photos/seed/${name}/100/100`
    });
  }

  const value = { user, login, logout, signup };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
