import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useApi } from './ApiContext.jsx';
import { useAuth } from './AuthContext.jsx';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const api = useApi();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [partners, setPartners] = useState([]); // vendors + customers
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [vendorBills, setVendorBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const computeProgress = useCallback((projectsList, tasksList) => {
    return projectsList.map(p => {
      const pts = tasksList.filter(t => t.projectId === p.id);
      if (!pts.length) return p.status === 'Completed' ? { ...p, progress: 100 } : { ...p, progress: p.progress || 0 };
      const done = pts.filter(t => t.status === 'Done').length;
      const computed = Math.round((done / pts.length) * 100);
      return { ...p, progress: p.status === 'Completed' ? 100 : computed };
    });
  }, []);

  const mapProduct = (p) => ({
    id: p.id,
    name: p.name,
    price: p.unitPrice ?? p.price ?? 0,
    quantityAvailable: p.quantityAvailable ?? 0,
    sku: p.sku || p.name?.toUpperCase()?.replace(/\s+/g,'-')?.slice(0,12) || 'SKU',
    createdAt: p.createdAt,
    tax: p.tax ?? 0,
    cost: p.cost ?? 0,
  });

  const mapSalesOrder = (so) => ({
    id: so.id,
    number: so.orderno || `SO-${so.id}`,
    projectId: so.projectId ?? so.project_id ?? null,
    partnerId: so.partnerId ?? so.partner_id ?? null,
    date: so.orderDate ?? so.order_date ?? so.createdAt ?? '',
    amount: Number(so.totalAmount ?? so.total_amount ?? 0),
    state: so.status || 'draft',
  });

  const mapPurchaseOrder = (po) => ({
    id: po.id,
    number: po.orderno || `PO-${po.id}`,
    projectId: po.projectId ?? po.project_id ?? null,
    vendorId: po.vendor_id ?? null,
    date: po.expected_delivery ?? po.createdAt ?? '',
    amount: Number(po.total_amount ?? 0),
    state: po.status || 'draft',
  });

  const mapInvoice = (inv) => ({
    id: inv.id,
    number: inv.id,
    projectId: null,
    salesOrderId: inv.sales_order_id ?? null,
    date: inv.createdAt ?? '',
    amount: Number(inv.amount ?? 0),
    state: inv.status || 'pending',
  });

  const mapVendorBill = (vb) => ({
    id: vb.id,
    number: vb.id,
    projectId: null,
    vendorId: vb.vendor_id ?? null,
    purchaseOrderId: vb.purchase_order_id ?? null,
    date: vb.createdAt ?? '',
    amount: Number(vb.amount ?? 0),
    state: vb.status || 'pending',
  });

  // Keep mapTask for backend-shaped fallbacks but avoid remapping already-mapped tasks
  const mapTask = (t) => {
    // If already mapped by ApiContext (camelCase + human status), return as-is with defaults
    const humanStatuses = ['New', 'In Progress', 'Blocked', 'Done'];
    if (humanStatuses.includes(t?.status) && t?.projectId !== undefined) {
      return { ...t, assignees: t.assignees || [], timesheets: t.timesheets || [] };
    }
    // Backend-shaped mapping fallback
    return {
      id: t.id,
      title: t.title,
      description: t.description || '',
      projectId: t.project_id,
      creatorId: t.created_by,
      status: t.status ? ({ new:'New', in_progress:'In Progress', blocked:'Blocked', done:'Done' }[t.status] || 'New') : 'New',
      priority: t.priority || 'Medium',
      estimatedHours: t.estimated_hours || 0,
      dueDate: t.deadline || null,
      assignees: [],
      timesheets: [],
    };
  };

  const mapExpense = (e) => ({
    id: e.id,
    projectId: e.project_id ?? null,
    userId: e.user_id ?? null,
    amount: Number(e.amount ?? 0),
    category: e.category || 'General',
    description: e.description || '',
    date: e.date || e.createdAt || '',
    status: e.status || 'pending',
    receipt: e.receiptUrl || null,
    number: e.id, // for table display
  });

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [usersRows, proj, prod, so, po, inv, vb, exp, partnerRows] = await Promise.all([
        api.listUsers().catch(()=>[]),
        api.listProjects(),
        api.listProducts().catch(()=>[]),
        api.listSalesOrders().catch(()=>[]),
        api.listPurchaseOrders().catch(()=>[]),
        api.listInvoices().catch(()=>[]),
        api.listVendorBills().catch(()=>[]),
        api.listExpenses().catch(()=>[]),
        api.listPartners().catch(()=>[]),
      ]);

      // Tasks per project (already mapped by ApiContext)
      const taskBatches = [];
      for (const p of proj) {
        try { taskBatches.push(await api.listProjectTasks(p.id)); } catch { taskBatches.push([]); }
      }
      const mergedTasks = taskBatches.flat();
      const hydrated = [];
      for (const t of mergedTasks) {
        try {
          const [assigneesRows, entries] = await Promise.all([
            api.listTaskAssignees(t.id),
            api.listTimeEntries(t.id),
          ]);
          hydrated.push({ ...mapTask(t), assignees: (assigneesRows || []).map(r => r.user_id), timesheets: entries || [] });
        } catch {
          hydrated.push(mapTask(t));
        }
      }

      setUsers(usersRows);
      setTasks(hydrated);
      setProjects(computeProgress(proj.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        managerId: p.manager_id,
        deadline: p.deadline,
        status: p.status ? ({ planned:'Planned', in_progress:'In Progress', completed:'Completed', on_hold:'On Hold' }[p.status] || 'Planned') : 'Planned',
        priority: p.priority || 'Medium',
        tags: p.tag ? p.tag.split(/\s+/).filter(Boolean) : [],
        image: p.image_url || null,
        progress: 0,
        revenue: 0,
        cost: 0,
      })), hydrated));
      setProducts((prod||[]).map(mapProduct));
      setSalesOrders((so||[]).map(mapSalesOrder));
      setPurchaseOrders((po||[]).map(mapPurchaseOrder));
      setInvoices((inv||[]).map(mapInvoice));
      setVendorBills((vb||[]).map(mapVendorBill));
      setExpenses((exp||[]).map(mapExpense));
      setPartners(partnerRows || []);
    } catch (e) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, [api, computeProgress]);

  useEffect(() => { refresh(); }, [refresh]);

  const getProjectById = (id) => projects.find(p => p.id === id);
  const getTasksByProjectId = (projectId) => tasks.filter(t => t.projectId === projectId);
  const getPartnerName = (id) => partners.find(p => p.id === id)?.name || '';
  const getPartnerByRole = (role) => partners.filter(p => p.role === role);

  // --- Projects & Tasks (existing helpers) ---
  const upsertProject = async (project) => {
    if (project.id) {
      const updated = await api.updateProject(project.id, project);
      setProjects(prev => computeProgress(prev.map(p => p.id === updated.id ? { ...p, ...updated } : p), tasks));
    } else {
      const created = await api.createProject(project);
      setProjects(prev => computeProgress([...prev, created], tasks));
    }
  };

  const removeProject = async (projectId) => {
    try { await api.deleteProject(projectId); } catch {}
    setProjects(prev => prev.filter(p => p.id !== projectId));
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
  };

  const upsertTask = async (task) => {
    // Treat only numeric IDs as persisted; string temp IDs like 'task-xyz' should create
    const hasPersistedId = typeof task.id === 'number' || /^\d+$/.test(String(task.id || ''));
    if (hasPersistedId) {
      const updated = await api.updateTask(task.id, task);
      setTasks(prev => {
        const next = prev.map(t => t.id === updated.id ? { ...t, ...updated } : t);
        setProjects(pr => computeProgress(pr, next));
        return next;
      });
    } else {
      const { id: _tempId, ...payload } = task; // drop temporary id
      const created = await api.createTask(payload);
      setTasks(prev => {
        const next = [...prev, created];
        setProjects(pr => computeProgress(pr, next));
        return next;
      });
    }
  };

  const removeTask = async (taskId) => {
    try { await api.deleteTask(taskId); } catch {}
    setTasks(prev => {
      const next = prev.filter(t => t.id !== taskId);
      setProjects(pr => computeProgress(pr, next));
      return next;
    });
  };

  // --- Products ---
  const createProduct = async (prod) => {
    const body = {
      name: prod.name,
      unitPrice: prod.price ?? prod.unitPrice ?? 0,
      quantityAvailable: prod.quantityAvailable ?? 0,
      tax: prod.tax ?? 0,
      cost: prod.cost ?? 0,
    };
    const created = await api.createProduct(body);
    setProducts(prev => [...prev, mapProduct(created)]);
    return created;
  };
  const updateProduct = async (id, patch) => {
    const body = {};
    if (patch.name != null) body.name = patch.name;
    if (patch.price != null) body.unitPrice = patch.price;
    if (patch.unitPrice != null) body.unitPrice = patch.unitPrice;
    if (patch.quantityAvailable != null) body.quantityAvailable = patch.quantityAvailable;
    if (patch.tax != null) body.tax = patch.tax;
    if (patch.cost != null) body.cost = patch.cost;
    const updated = await api.updateProduct(id, body);
    setProducts(prev => prev.map(p => p.id === id ? mapProduct(updated) : p));
    return updated;
  };
  const updateProductQuantity = async (id, quantityAvailable) => {
    try { await updateProduct(id, { quantityAvailable }); } catch (e) { console.warn('Failed to update product qty', e); }
  };

  // --- Sales Orders ---
  const createSalesOrder = async (form) => {
    const body = {
      partnerId: form.partnerId,
      projectId: form.projectId,
      orderDate: form.date,
      status: form.state?.toLowerCase?.() || 'draft',
      totalAmount: form.amount,
      note: form.note || '',
    };
    const created = await api.createSalesOrder(body);
    // Line items
    for (const it of (form.items||[])) {
      if (!it.id) continue; // must be product id
      const sub_total = Number(it.qty||0) * Number(it.price||0);
      try { await api.createSalesOrderItem({ sales_order_id: created.id, product_id: it.id, quantity: it.qty, sub_total }); } catch (e) { console.warn('Create sales-order-item failed', e); }
      if (form.state === 'Confirmed') {
        // decrease inventory
        const prod = products.find(p => p.id === it.id);
        if (prod) { updateProductQuantity(prod.id, Math.max(0, (prod.quantityAvailable||0) - (it.qty||0))); }
      }
    }
    setSalesOrders(prev => [...prev, mapSalesOrder(created)]);
    return created;
  };
  const updateSalesOrder = async (id, patch) => {
    const body = {};
    if (patch.partnerId != null) body.partnerId = patch.partnerId;
    if (patch.projectId != null) body.projectId = patch.projectId;
    if (patch.date) body.orderDate = patch.date;
    if (patch.state) body.status = patch.state.toLowerCase();
    if (patch.amount != null) body.totalAmount = patch.amount;
    if (patch.note != null) body.note = patch.note;
    const updated = await api.updateSalesOrder(id, body);
    setSalesOrders(prev => prev.map(o => o.id === id ? mapSalesOrder(updated) : o));
    return updated;
  };

  // --- Purchase Orders ---
  const createPurchaseOrder = async (form) => {
    const body = {
      vendor_id: form.vendorId,
      project_id: form.projectId,
      expected_delivery: form.date,
      status: form.state?.toLowerCase?.() || 'draft',
      total_amount: form.amount,
      note: form.note || '',
    };
    const created = await api.createPurchaseOrder(body);
    for (const it of (form.items||[])) {
      if (!it.id) continue;
      const sub_total = Number(it.qty||0) * Number(it.price||0);
      try { await api.createPurchaseOrderItem({ purchase_order_id: created.id, product_id: it.id, quantity: it.qty, sub_total }); } catch (e) { console.warn('Create purchase-order-item failed', e); }
    }
    setPurchaseOrders(prev => [...prev, mapPurchaseOrder(created)]);
    return created;
  };
  const updatePurchaseOrder = async (id, patch) => {
    const body = {};
    if (patch.vendorId != null) body.vendor_id = patch.vendorId;
    if (patch.projectId != null) body.project_id = patch.projectId;
    if (patch.date) body.expected_delivery = patch.date;
    if (patch.state) body.status = patch.state.toLowerCase();
    if (patch.amount != null) body.total_amount = patch.amount;
    if (patch.note != null) body.note = patch.note;
    const updated = await api.updatePurchaseOrder(id, body);
    setPurchaseOrders(prev => prev.map(o => o.id === id ? mapPurchaseOrder(updated) : o));
    return updated;
  };

  // --- Invoices ---
  const createInvoice = async (form) => {
    const body = { sales_order_id: form.salesOrderId, amount: form.amount }; // status handled by backend
    const created = await api.createInvoice(body);
    setInvoices(prev => [...prev, mapInvoice(created)]);
    return created;
  };
  const updateInvoice = async (id, patch) => {
    const body = {};
    if (patch.amount != null) body.amount = patch.amount;
    if (patch.state) body.status = patch.state.toLowerCase();
    const updated = await api.updateInvoice(id, body);
    setInvoices(prev => prev.map(i => i.id === id ? mapInvoice(updated) : i));
    return updated;
  };

  // --- Vendor Bills ---
  const createVendorBill = async (form) => {
    const body = { vendor_id: form.vendorId, purchase_order_id: form.purchaseOrderId, amount: form.amount, status: form.state?.toLowerCase?.() || 'pending' };
    const created = await api.createVendorBill(body);
    setVendorBills(prev => [...prev, mapVendorBill(created)]);
    return created;
  };
  const updateVendorBill = async (id, patch) => {
    const body = {};
    if (patch.vendorId != null) body.vendor_id = patch.vendorId;
    if (patch.purchaseOrderId != null) body.purchase_order_id = patch.purchaseOrderId;
    if (patch.amount != null) body.amount = patch.amount;
    if (patch.state) body.status = patch.state.toLowerCase();
    const updated = await api.updateVendorBill(id, body);
    setVendorBills(prev => prev.map(b => b.id === id ? mapVendorBill(updated) : b));
    return updated;
  };

  // --- Expenses ---
  const createExpense = async (form) => {
    const body = {
      amount: form.amount,
      project_id: form.projectId,
      user_id: form.userId || user?.id,
      category: form.category || 'General',
      description: form.description,
      date: form.date,
      status: form.state?.toLowerCase?.() || 'pending',
      receiptUrl: form.receipt || null,
    };
    const created = await api.createExpense(body);
    setExpenses(prev => [...prev, mapExpense(created)]);
    return created;
  };
  const updateExpense = async (id, patch) => {
    const body = {};
    if (patch.amount != null) body.amount = patch.amount;
    if (patch.projectId != null) body.project_id = patch.projectId;
    if (patch.userId != null) body.user_id = patch.userId;
    if (patch.category != null) body.category = patch.category;
    if (patch.description != null) body.description = patch.description;
    if (patch.date) body.date = patch.date;
    if (patch.state) body.status = patch.state.toLowerCase();
    if (patch.receipt) body.receiptUrl = patch.receipt;
    const updated = await api.updateExpense(id, body);
    setExpenses(prev => prev.map(e => e.id === id ? mapExpense(updated) : e));
    return updated;
  };

  const value = useMemo(() => ({
    projects, tasks, users, products, partners,
    salesOrders, purchaseOrders, invoices, vendorBills, expenses,
    loading, error, refresh,
    getProjectById, getTasksByProjectId, getPartnerName, getPartnerByRole,
    upsertProject, removeProject, upsertTask, removeTask,
    createProduct, updateProduct, updateProductQuantity,
    createSalesOrder, updateSalesOrder,
    createPurchaseOrder, updatePurchaseOrder,
    createInvoice, updateInvoice,
    createVendorBill, updateVendorBill,
    createExpense, updateExpense,
  }), [projects, tasks, users, products, partners, salesOrders, purchaseOrders, invoices, vendorBills, expenses, loading, error, refresh]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
