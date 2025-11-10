import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext.jsx';

const ApiContext = createContext(null);

// In dev, let Vite proxy handle /api to avoid CORS. In prod, use VITE_API_URL.
const API_BASE = import.meta.env.DEV
  ? '/api'
  : `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;

async function request(path, { method='GET', body, token } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch (networkErr) {
    throw new Error(`Network error: ${networkErr.message || networkErr}`);
  }
  const ct = res.headers.get('content-type') || '';
  let data = null;
  if (ct.includes('application/json')) { try { data = await res.json(); } catch { data = null; } }
  else { const text = await res.text().catch(()=> ''); throw new Error(`Unexpected content-type: ${ct || 'none'}`); }
  if (!res.ok) {
    const errList = Array.isArray(data?.errors) ? data.errors.map(e => e.msg || e.message || `${e.param||''} invalid`).join(', ') : null;
    const msg = data?.message || errList || `${res.status} ${res.statusText}`;
    throw new Error(msg);
  }
  return data;
}

const isHttpUrl = (u) => typeof u === 'string' && /^https?:\/\//i.test(u) && u.length <= 255;

// Mapping (backend snake_case -> frontend camelCase)
const mapProject = p => ({
  id: p.id,
  name: p.name,
  description: p.description,
  managerId: p.manager_id,
  deadline: p.deadline,
  status: p.status ? statusMap.project.fromBackend(p.status) : 'Planned',
  priority: p.priority || 'Medium',
  tags: p.tag ? p.tag.split(/\s+/).filter(Boolean) : [],
  image: p.image_url || null,
  // Derived placeholders
  progress: 0,
  revenue: 0,
  cost: 0,
});

const mapTask = t => ({
  id: t.id,
  title: t.title,
  description: t.description || '',
  projectId: t.project_id,
  creatorId: t.created_by,
  status: t.status ? statusMap.task.fromBackend(t.status) : 'New',
  priority: t.priority || 'Medium',
  estimatedHours: t.estimated_hours || 0,
  dueDate: t.deadline || null,
  assignees: [],
  timesheets: [],
});

const statusMap = {
  project: {
    fromBackend: s => ({ planned:'Planned', in_progress:'In Progress', completed:'Completed', on_hold:'On Hold' }[s] || 'Planned'),
    toBackend: s => ({ 'Planned':'planned', 'In Progress':'in_progress', 'Completed':'completed', 'On Hold':'on_hold' }[s] || 'planned')
  },
  task: {
    fromBackend: s => ({ new:'New', in_progress:'In Progress', blocked:'Blocked', done:'Done' }[s] || 'New'),
    toBackend: s => ({ 'New':'new', 'In Progress':'in_progress', 'Blocked':'blocked', 'Done':'done' }[s] || 'new')
  }
};

export const ApiProvider = ({ children }) => {
  const { token } = useAuth();

  const api = useMemo(() => ({
    // Projects
    async listProjects() { const rows = await request('/projects', { token }); return rows.map(mapProject); },
    async getProject(id) { const p = await request(`/projects/${id}`, { token }); return mapProject(p); },
    async createProject(p) {
      const payload = {
        name: p.name,
        description: p.description,
        manager_id: p.managerId,
        deadline: p.deadline,
        status: statusMap.project.toBackend(p.status),
        priority: p.priority,
        tag: Array.isArray(p.tags) ? p.tags.join(' ') : '',
      };
      if (isHttpUrl(p.image)) payload.image_url = p.image;
      if (p.budget != null) payload.budget = p.budget;
      const created = await request('/projects', { method:'POST', body: payload, token });
      return mapProject(created);
    },
    async updateProject(id, patch) {
      const payload = {};
      if (patch.name) payload.name = patch.name;
      if (patch.description) payload.description = patch.description;
      if (patch.managerId) payload.manager_id = patch.managerId;
      if (patch.deadline) payload.deadline = patch.deadline;
      if (patch.status) payload.status = statusMap.project.toBackend(patch.status);
      if (patch.priority) payload.priority = patch.priority;
      if (patch.tags) payload.tag = patch.tags.join(' ');
      if (isHttpUrl(patch.image)) payload.image_url = patch.image;
      if (patch.budget != null) payload.budget = patch.budget;
      const updated = await request(`/projects/${id}`, { method:'PUT', body: payload, token });
      return mapProject(updated);
    },
    async deleteProject(id) { return request(`/projects/${id}`, { method:'DELETE', token }); },
    async listProjectTasks(projectId) { const rows = await request(`/projects/${projectId}/tasks`, { token }); return rows.map(mapTask); },

    // Tasks
    async getTask(id) { const t = await request(`/tasks/${id}`, { token }); return mapTask(t); },
    async createTask(t) {
      const payload = {
        title: t.title,
        description: t.description,
        project_id: t.projectId,
        status: statusMap.task.toBackend(t.status),
        priority: t.priority,
        deadline: t.dueDate,
        estimated_hours: t.estimatedHours,
      };
      const created = await request('/tasks', { method:'POST', body: payload, token });
      return mapTask(created);
    },
    async updateTask(id, patch) {
      const payload = {};
      if (patch.title) payload.title = patch.title;
      if (patch.description) payload.description = patch.description;
      if (patch.projectId) payload.project_id = patch.projectId;
      if (patch.status) payload.status = statusMap.task.toBackend(patch.status);
      if (patch.priority) payload.priority = patch.priority;
      if (patch.dueDate) payload.deadline = patch.dueDate;
      if (patch.estimatedHours != null) payload.estimated_hours = patch.estimatedHours;
      const updated = await request(`/tasks/${id}`, { method:'PUT', body: payload, token });
      return mapTask(updated);
    },
    async deleteTask(id) { return request(`/tasks/${id}`, { method:'DELETE', token }); },

    // Task Assignees
    async listTaskAssignees(taskId) { return request(`/task-assignees/task/${taskId}`, { token }); },
    async listTaskAssigneeUsers(taskId) { return request(`/tasks/${taskId}/assignees`, { token }); },
    async assignUser(taskId, userId) { return request('/task-assignees', { method:'POST', body:{ task_id: taskId, user_id: userId }, token }); },
    async unassignUser(taskId, userId) { return request('/task-assignees', { method:'DELETE', body:{ task_id: taskId, user_id: userId }, token }); },
    async countTasksForUser(userId) { return request(`/task-assignees/user/${userId}/count`, { token }); },

    // Partners
    async createPartner(body) { return request('/partners', { method:'POST', body, token }); },
    async listPartners(role) { const q = role ? `?role=${encodeURIComponent(role)}` : ''; return request(`/partners${q}`, { token }); },
    async getPartner(id) { return request(`/partners/${id}`, { token }); },
    async updatePartner(id, body) { return request(`/partners/${id}`, { method:'PUT', body, token }); },

    // Products
    async createProduct(body) { return request('/products', { method:'POST', body, token }); },
    async listProducts() { return request('/products', { token }); },
    async getProduct(id) { return request(`/products/${id}`, { token }); },
    async updateProduct(id, body) { return request(`/products/${id}`, { method:'PUT', body, token }); },

    // Purchase Orders
    async createPurchaseOrder(body) { return request('/purchase-orders', { method:'POST', body, token }); },
    async listPurchaseOrders() { return request('/purchase-orders', { token }); },
    async getPurchaseOrder(id) { return request(`/purchase-orders/${id}`, { token }); },
    async updatePurchaseOrder(id, body) { return request(`/purchase-orders/${id}`, { method:'PUT', body, token }); },

    // Purchase Order Items
    async createPurchaseOrderItem(body) { return request('/purchase-order-items', { method:'POST', body, token }); },
    async getPurchaseOrderItem(id) { return request(`/purchase-order-items/${id}`, { token }); },
    async updatePurchaseOrderItem(id, body) { return request(`/purchase-order-items/${id}`, { method:'PUT', body, token }); },

    // Sales Orders
    async createSalesOrder(body) { return request('/sales-orders', { method:'POST', body, token }); },
    async listSalesOrders() { return request('/sales-orders', { token }); },
    async getSalesOrder(id) { return request(`/sales-orders/${id}`, { token }); },
    async updateSalesOrder(id, body) { return request(`/sales-orders/${id}`, { method:'PUT', body, token }); },

    // Sales Order Items
    async createSalesOrderItem(body) { return request('/sales-order-items', { method:'POST', body, token }); },
    async getSalesOrderItem(id) { return request(`/sales-order-items/${id}`, { token }); },
    async updateSalesOrderItem(id, body) { return request(`/sales-order-items/${id}`, { method:'PUT', body, token }); },

    // Invoices
    async createInvoice(body) { return request('/invoices', { method:'POST', body, token }); },
    async listInvoices() { return request('/invoices', { token }); },
    async getInvoice(id) { return request(`/invoices/${id}`, { token }); },
    async updateInvoice(id, body) { return request(`/invoices/${id}`, { method:'PUT', body, token }); },

    // Invoice Items
    async createInvoiceItem(body) { return request('/invoice-items', { method:'POST', body, token }); },
    async getInvoiceItem(id) { return request(`/invoice-items/${id}`, { token }); },
    async updateInvoiceItem(id, body) { return request(`/invoice-items/${id}`, { method:'PUT', body, token }); },

    // Vendor Bills
    async createVendorBill(body) { return request('/vendor-bills', { method:'POST', body, token }); },
    async listVendorBills() { return request('/vendor-bills', { token }); },
    async getVendorBill(id) { return request(`/vendor-bills/${id}`, { token }); },
    async updateVendorBill(id, body) { return request(`/vendor-bills/${id}`, { method:'PUT', body, token }); },

    // Vendor Bill Items
    async createVendorBillItem(body) { return request('/vendor-bill-items', { method:'POST', body, token }); },
    async listVendorBillItems(params={}) { const q = new URLSearchParams(params).toString(); return request(`/vendor-bill-items${q?`?${q}`:''}`, { token }); },
    async getVendorBillItem(id) { return request(`/vendor-bill-items/${id}`, { token }); },
    async updateVendorBillItem(id, body) { return request(`/vendor-bill-items/${id}`, { method:'PUT', body, token }); },

    // Expenses
    async createExpense(body) { return request('/expenses', { method:'POST', body, token }); },
    async listExpenses(params={}) {
      const q = new URLSearchParams(params).toString();
      const path = q ? `/expenses?${q}` : '/expenses';
      return request(path, { token });
    },
    async getExpense(id) { return request(`/expenses/${id}`, { token }); },
    async updateExpense(id, body) { return request(`/expenses/${id}`, { method:'PUT', body, token }); },

    // Time Entries
    async createTimeEntry(body) { return request('/time-entries', { method:'POST', body, token }); },
    async listTimeEntries(params={}) { const q = new URLSearchParams(params).toString(); return request(`/time-entries${q?`?${q}`:''}`, { token }); },
    async getTimeEntry(id) { return request(`/time-entries/${id}`, { token }); },
    async updateTimeEntry(id, body) { return request(`/time-entries/${id}`, { method:'PUT', body, token }); },

    // Invoices helper for Sales Order CTA
    async createInvoiceForSalesOrder(sales_order_id, amount) { return request('/invoices', { method:'POST', body:{ sales_order_id, amount }, token }); },

    // Users
    async listUsers() { return request('/users', { token }); },
    async updateUser(id, body) { return request(`/users/${id}`, { method:'PATCH', body, token }); },

    // Summaries
    async fetchProjectSummary(id) { return request(`/projects/${id}/summary`, { token }); },
  }), [token]);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);
