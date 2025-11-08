import React, { createContext, useContext, useState } from 'react';
import { initialData } from '../data/mockData.js';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(initialData);

  // In a real app, you'd have functions here to interact with an API (e.g., using React Query)
  // For this MVP, we'll just pass the static data and some CRUD helpers.

  const getProjectById = (id) => {
    return data.projects.find(p => p.id === id);
  };
  
  const getTasksByProjectId = (projectId) => {
    return data.tasks.filter(t => t.projectId === projectId);
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
        next = [...list, { ...project, id: newId }];
      } else {
        next[idx] = { ...list[idx], ...project };
      }
      return { ...prev, projects: next };
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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  return useContext(DataContext);
};
