
import React, { createContext, useContext, useState } from 'react';
import { initialData } from '../data/mockData.js';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(initialData);

  // In a real app, you'd have functions here to interact with an API (e.g., using React Query)
  // For this MVP, we'll just pass the static data.
  
  const getProjectById = (id) => {
    return data.projects.find(p => p.id === id);
  };
  
  const getTasksByProjectId = (projectId) => {
    return data.tasks.filter(t => t.projectId === projectId);
  }

  const value = { ...data, getProjectById, getTasksByProjectId };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  return useContext(DataContext);
};
