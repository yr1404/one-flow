import React, { createContext, useContext, useState } from 'react';
import { initialData } from '../data/mockData.js';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const computeProgress = (projects, tasks) => {
    return projects.map(p => {
      const pts = tasks.filter(t => t.projectId === p.id);
      if (!pts.length) return p.status === 'Completed' ? { ...p, progress: 100 } : { ...p, progress: p.progress || 0 };
      const done = pts.filter(t => t.status === 'Done').length;
      const computed = Math.round((done / pts.length) * 100);
      return { ...p, progress: p.status === 'Completed' ? 100 : computed };
    });
  };

  const [data, setData] = useState(() => {
    const base = initialData;
    const updatedProjects = computeProgress(base.projects || [], base.tasks || []);
    return { ...base, projects: updatedProjects };
  });

  // In a real app, you'd have functions here to interact with an API (e.g., using React Query)
  // For this MVP, we'll just pass the static data and some CRUD helpers.

  const getProjectById = (id) => {
    return data.projects.find(p => p.id === id);
  };
  
  const getTasksByProjectId = (projectId) => {
    return data.tasks.filter(t => t.projectId === projectId);
  };

  // Recalculate progress for all projects after task changes
  const recalcAllProjectProgress = (tasksList) => {
    return computeProgress(data.projects, tasksList);
  };

  const upsertTask = (task) => {
    setData(prev => {
      const list = prev.tasks || [];
      const idx = list.findIndex(t => t.id === task.id);
      const nextTasks = idx === -1 ? [...list, task] : list.map(t => t.id === task.id ? { ...t, ...task } : t);
      const nextProjects = recalcAllProjectProgress(nextTasks);
      return { ...prev, tasks: nextTasks, projects: nextProjects };
    });
  };

  const removeTask = (taskId) => {
    setData(prev => {
      const nextTasks = prev.tasks.filter(t => t.id !== taskId);
      const nextProjects = recalcAllProjectProgress(nextTasks);
      return { ...prev, tasks: nextTasks, projects: nextProjects };
    });
  };

  // --- Helpers for documents/entities ---
  const collectionKeyMap = {
    'Sales Order': 'salesOrders',
    'Purchase Order': 'purchaseOrders',
    'Customer Invoice': 'customerInvoices',
    'Vendor Bill': 'vendorBills',
    'Expense': 'expenses',
  };

  const idPrefixMap = {
    'Sales Order': { id: 'SO', number: 'SO' },
    'Purchase Order': { id: 'PO', number: 'PO' },
    'Customer Invoice': { id: 'INV', number: 'INV' },
    'Vendor Bill': { id: 'BILL', number: 'BILL' },
    'Expense': { id: 'EXP', number: 'EXP' },
  };

  const upsertEntity = (type, entity) => {
    const key = collectionKeyMap[type];
    if (!key) return;

    setData(prev => {
      const list = prev[key] || [];
      const existingIndex = list.findIndex(e => e.id === entity.id);

      let next = [...list];
      // Generate IDs and Numbers if not provided
      if (existingIndex === -1) {
        const prefixes = idPrefixMap[type];
        const nextIndex = list.length + 1;
        const pad = (n) => String(n).padStart(3, '0');
        const year = new Date().getFullYear();
        const newId = entity.id || `${prefixes.id}-${pad(nextIndex)}`;
        const newNumber = entity.number || `${prefixes.number}${year}-${pad(nextIndex)}`;
        const toInsert = { ...entity, id: newId, number: newNumber };
        next = [...list, toInsert];
      } else {
        next[existingIndex] = { ...list[existingIndex], ...entity };
      }

      return { ...prev, [key]: next };
    });
  };

  const removeEntity = (type, id) => {
    const key = collectionKeyMap[type];
    if (!key) return;
    setData(prev => ({ ...prev, [key]: prev[key].filter(e => e.id !== id) }));
  };

  const upsertProject = (project) => {
    setData(prev => {
      const list = prev.projects || [];
      const idx = list.findIndex(p => p.id === project.id);
      let next = [...list];
      if (idx === -1) {
        const newId = project.id || 'proj-' + Math.random().toString(36).slice(2);
        const baseProj = { ...project, id: newId };
        const withProgress = baseProj.status === 'Completed' ? { ...baseProj, progress: 100 } : baseProj;
        next = [...list, withProgress];
      } else {
        const merged = { ...list[idx], ...project };
        next[idx] = merged.status === 'Completed' ? { ...merged, progress: 100 } : merged;
      }
      // Recompute progress for all projects based on current tasks (in case task distribution changed)
      const recomputed = computeProgress(next, prev.tasks);
      return { ...prev, projects: recomputed };
    });
  };

  // Delete a project and cascade removal of related records
  const removeProject = (projectId) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== projectId),
      tasks: prev.tasks.filter(t => t.projectId !== projectId),
      salesOrders: prev.salesOrders.filter(e => e.projectId !== projectId),
      purchaseOrders: prev.purchaseOrders.filter(e => e.projectId !== projectId),
      customerInvoices: prev.customerInvoices.filter(e => e.projectId !== projectId),
      vendorBills: prev.vendorBills.filter(e => e.projectId !== projectId),
      expenses: prev.expenses.filter(e => e.projectId !== projectId),
    }));
  };

  const value = { 
    ...data, 
    getProjectById, 
    getTasksByProjectId,
    upsertEntity,
    removeEntity,
    upsertProject,
    removeProject,
    upsertTask,
    removeTask,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  return useContext(DataContext);
};
