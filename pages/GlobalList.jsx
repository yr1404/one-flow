import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { useApi } from '../contexts/ApiContext.jsx';
import { Plus, Search, X, Calendar, DollarSign, User, FileText, Building2, PackageSearch, Download } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { createPortal } from 'react-dom';
import logoUrl from '../assets/logo.png';

// Helper: embed images as data URLs and wait for assets before printing
const toDataURL = async (url) => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

const waitForImagesAndFonts = async (win) => {
  const doc = win.document;
  const images = Array.from(doc.images || []);
  const imagePromises = images.map(img => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise(resolve => {
      const done = () => resolve();
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    });
  });
  const fontPromise = doc.fonts ? doc.fonts.ready.catch(()=>{}) : Promise.resolve();
  // Safety timeout so we don't hang if something never resolves
  const timeout = new Promise(resolve => setTimeout(resolve, 1000));
  await Promise.race([Promise.all([fontPromise, ...imagePromises]), timeout]);
};

let cachedLogoDataUrl = null; // cache logo data URL for downloadDoc

// Normalize values to yyyy-MM-dd for <input type="date">
const toDateInputValue = (v) => {
  if (!v) return '';
  if (typeof v === 'string') return v.slice(0, 10);
  try { return new Date(v).toISOString().slice(0, 10); } catch { return ''; }
};

const GlobalList = ({ type }) => {
  const data = useData();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const listDataMap = {
    'Sales Order': data.salesOrders,
    'Purchase Order': data.purchaseOrders,
    'Customer Invoice': data.invoices,
    'Vendor Bill': data.vendorBills,
    'Expense': data.expenses,
  };
  const headersMap = {
    'Sales Order': ['Number', 'Project', 'Customer', 'Date', 'Amount', 'Status'],
    'Purchase Order': ['Number', 'Project', 'Vendor', 'Date', 'Amount', 'Status'],
    'Customer Invoice': ['Number', 'Sales Order', 'Date', 'Amount', 'Status'],
    'Vendor Bill': ['Number', 'PO', 'Date', 'Amount', 'Status'],
    'Expense': ['Number', 'Project', 'Employee', 'Date', 'Amount', 'Description', 'Status'],
  };
  const listData = listDataMap[type] || [];
  const headers = headersMap[type] || [];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return listData;
    return listData.filter(item => JSON.stringify(item).toLowerCase().includes(q));
  }, [listData, search]);

  const renderRow = (item) => {
    switch (type) {
      case 'Sales Order': return [item.number, data.getProjectById(item.projectId)?.name, data.getPartnerName(item.partnerId), item.date, item.amount, item.state];
      case 'Purchase Order': return [item.number, data.getProjectById(item.projectId)?.name, data.getPartnerName(item.vendorId), item.date, item.amount, item.state];
      case 'Customer Invoice': return [item.number, item.salesOrderId, item.date, item.amount, item.state];
      case 'Vendor Bill': return [item.number, item.purchaseOrderId, item.date, item.amount, item.state];
      case 'Expense': return [item.number, data.getProjectById(item.projectId)?.name, item.userId, item.date, item.amount, item.description, item.status];
      default: return [];
    }
  };

  const tabItems = [
    { label: 'Sales Orders', type: 'Sales Order', path: '/sales-orders' },
    { label: 'Purchase Orders', type: 'Purchase Order', path: '/purchase-orders' },
    { label: 'Customer Invoices', type: 'Customer Invoice', path: '/customer-invoices' },
    { label: 'Vendor Bills', type: 'Vendor Bill', path: '/vendor-bills' },
    { label: 'Expenses', type: 'Expense', path: '/expenses' },
  ];

  const activeTab = 'px-4 py-2 text-sm font-semibold rounded-lg bg-brand-indigo text-white shadow-soft';
  const inactiveTab = 'px-4 py-2 text-sm font-semibold rounded-lg text-text-secondary hover:bg-white/70 transition';

  const onCreate = () => { setEditing(null); setModalOpen(true); };
  const onEdit = (item) => { setEditing(item); setModalOpen(true); };
  const hideCreate = type === 'Customer Invoice' || type === 'Vendor Bill';

  // Export doc only for invoices & vendor bills for now
  const downloadDoc = async (item) => {
    const isInvoice = type === 'Customer Invoice';
    const title = isInvoice ? 'CUSTOMER INVOICE' : 'VENDOR BILL';
    const items = item.items || [];
    const subtotal = items.reduce((s,i)=> s + (i.qty*i.price||0), 0);
    const discount = 0; // placeholder for future discount support
    const taxTotal = 0; // placeholder until taxes are implemented
    const grandTotal = subtotal - discount + taxTotal;
    const projectName = downloadDocProjectName(item.projectId);

    const date = item.date || new Date().toISOString().slice(0,10);
    const dueDate = (()=>{ const d = new Date(date); d.setDate(d.getDate()+30); return d.toISOString().slice(0,10); })();
    const currency = (n)=> (n||0).toLocaleString('en-US',{style:'currency',currency:'USD'});

    // Ensure logo is converted to base64 to eliminate race conditions with print rendering
    if (!cachedLogoDataUrl) {
      try {
        const blob = await fetch(logoUrl).then(r=>r.blob());
        cachedLogoDataUrl = await new Promise(res => { const reader = new FileReader(); reader.onload = () => res(reader.result); reader.readAsDataURL(blob); });
      } catch (e) {
        cachedLogoDataUrl = logoUrl; // fallback to original URL if conversion fails
      }
    }
    const logoImg = `<img id='logo' src='${cachedLogoDataUrl}' alt='Logo' style='height:48px;width:48px;object-fit:contain;border-radius:8px'/>`;

    const lineRows = items.map((i, idx) => {
      const unit = currency(i.price||0);
      const line = currency((i.qty*i.price)||0);
      return `<tr>\n        <td class='col-index'>${idx+1}</td>\n        <td class='col-desc'>\n          <div class='main'>${i.name||''}</div>\n          ${i.description? `<div class='sub'>${i.description}</div>`: ''}\n        </td>\n        <td class='col-qty'>${i.qty||0}</td>\n        <td class='col-rate'>${unit}</td>\n        <td class='col-amount'>${line}</td>\n      </tr>`;
    }).join('') || `<tr><td colspan='5' class='no-items'>No line items</td></tr>`;

    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'/><title>${title} ${item.number||''}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Manrope:wght@600;700&display=swap" rel="stylesheet">
      <style>
        :root { --ink:#0f172a; --muted:#64748b; --border:#e5e7eb; --bg:#ffffff; --brand:#111827; --blue:#0B3B8C; --header:#0b3b8c; --tableHead:#0b3b8c; --tableHeadText:#ffffff; }
        * { box-sizing:border-box; }
        html, body { margin:0; background:#f8fafc; }
        body { color:var(--ink); font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size:13px; }
        .page { width:960px; max-width:96%; margin:24px auto; background:var(--bg); border-radius:14px; padding:32px 36px 40px; box-shadow: 0 8px 32px rgba(2,6,23,.08); }
        .top { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; }
        .brand { display:flex; gap:14px; align-items:center; }
        .brand-title { font-weight:700; font-size:18px; }
        .brand-addr { font-size:11.5px; color:var(--muted); line-height:1.5; margin-top:4px; }
        .title-block { text-align:right; }
        .title { font: 700 26px Manrope, Inter, sans-serif; letter-spacing:.4px; color:#0b3b8c; text-transform:uppercase; }
        .small { font-size:11.5px; color:var(--muted); }
        .balance { margin-top:8px; font-size:12.5px; color:var(--muted); }
        .balance strong { display:block; color:#111827; font-size:17px; margin-top:2px; }
        .bill-grid { display:grid; grid-template-columns: 2fr 1fr; gap:24px; margin-top:28px; }
        .billto h3 { font-size:12px; color:var(--muted); text-transform:uppercase; margin:0 0 6px; }
        .billto-name { font-weight:600; font-size:13.5px; }
        .info-list { font-size:12.5px; line-height:1.9; }
        .info-list .label { color:var(--muted); width:120px; display:inline-block; }
        .supply { font-size:11.5px; color:var(--muted); margin:24px 0 8px; }
        table.items { width:100%; border-collapse:collapse; overflow:hidden; border-radius:8px; }
        table.items thead th { font-size:13px; letter-spacing:.2px; color:var(--tableHeadText); background:var(--tableHead); padding:12px 12px; }
        table.items tbody td { font-size:12.5px; padding:12px 12px; border-bottom:1px solid var(--border); vertical-align:top; }
        .col-index { width:36px; text-align:center; color:#111827; }
        .col-desc .main { font-weight:600; }
        .col-desc .sub { color:var(--muted); font-size:11.5px; margin-top:4px; }
        .col-qty { width:130px; text-align:center; }
        .col-rate { width:130px; text-align:center; }
        .col-amount { width:140px; text-align:right; font-weight:600; }
        .no-items { text-align:center; color:var(--muted); padding:22px; }
        .totals-box { margin-left:auto; margin-top:18px; width:360px; }
        .totals-row { display:flex; justify-content:space-between; padding:8px 0; font-size:13.5px; }
        .totals-row.total { border-top:1px solid var(--border); margin-top:6px; padding-top:12px; font-weight:700; }
        .balance-row { background:#f3f4f6; border-radius:8px; padding:12px 14px; margin-top:10px; display:flex; justify-content:space-between; font-weight:700; }
        .footer { margin-top:22px; font-size:11.5px; color:var(--muted); }
        @media print { @page { size: A4; margin: 8mm 8mm 10mm 8mm; } html, body { background:#fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } .page { box-shadow:none; margin:0; width:190mm; max-width:none; padding:8mm 8mm 10mm; border-radius:0; } .title { font-size: 28px; } }
      </style>
    </head><body>
      <div class='page'>
        <div class='top'>
          <div>
            <div class='brand'>${logoImg}<div>
              <div class='brand-title'>OneFlow</div>
              <div class='brand-addr'>3317 Buddy Shoals, Lake Colf, Oklahoma 2505</div>
            </div></div>
          </div>
          <div class='title-block'>
            <div class='title'>${title}</div>
            <div class='small'># ${item.number||''}</div>
            <div class='balance'>Balance Due<strong>${currency(grandTotal)}</strong></div>
          </div>
        </div>

        <div class='bill-grid'>
          <div class='billto'>
            <h3>Bill To</h3>
            <div class='billto-name'>${isInvoice ? (item.customer||'—') : (item.vendor||'—')}</div>
            <div class='small'>${projectName || ''}</div>
          </div>
          <div class='info'>
            <div class='info-list'>
              <div><span class='label'>Invoice Date :</span> ${date}</div>
              <div><span class='label'>Due Date :</span> ${dueDate}</div>
              <div><span class='label'>Status :</span> ${item.state||'Draft'}</div>
              <div><span class='label'>Number :</span> ${item.number||''}</div>
            </div>
          </div>
        </div>

        <div class='supply'>Place of Supply: United States</div>

        <table class='items'>
          <thead><tr><th>#</th><th>Class & Description</th><th>No. of Sessions</th><th>Rate</th><th>Amount</th></tr></thead>
          <tbody>${lineRows}</tbody>
        </table>

        <div class='totals-box'>
          <div class='totals-row'><span>Sub Total</span><span>${currency(subtotal)}</span></div>
          <div class='totals-row'><span>Discount</span><span>${currency(discount)}</span></div>
          ${taxTotal? `<div class='totals-row'><span>Tax</span><span>${currency(taxTotal)}</span></div>`: ''}
          <div class='totals-row total'><span>Total</span><span>${currency(grandTotal)}</span></div>
          <div class='balance-row'><span>Balance Due</span><span>${currency(grandTotal)}</span></div>
        </div>

        <div class='footer'>This is a system-generated document. Thank you for your business.</div>
      </div>
      <script>
        (function(){
          function triggerPrint(){
            Promise.resolve(window.document.fonts ? window.document.fonts.ready : null).then(function(){
              var imgs = Array.from(document.images);
              var pending = imgs.filter(function(i){ return !i.complete; });
              if (!pending.length) { return setTimeout(function(){ window.print(); }, 50); }
              var left = pending.length;
              pending.forEach(function(im){
                im.addEventListener('load', function(){ if(--left===0) setTimeout(function(){ window.print(); }, 50); });
                im.addEventListener('error', function(){ if(--left===0) setTimeout(function(){ window.print(); }, 50); });
              });
              // Fallback: ensure print even if image events fail
              setTimeout(function(){ window.print(); }, 2500);
            });
          }
          if (document.readyState === 'complete') triggerPrint(); else window.addEventListener('load', triggerPrint);
        })();
      </script>
    </body></html>`;

    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    // print now handled by embedded script after assets load
  };

  const downloadDocProjectName = (pid) => data.getProjectById(pid)?.name || '';

  return (
    <div className="glass-card shadow-soft">
      <div className="flex flex-wrap gap-2 p-4 pb-2 border-b border-brand-border/60">
        {tabItems.map(t => (
          <NavLink key={t.path} to={t.path} className={({ isActive }) => (isActive || t.type === type ? activeTab : inactiveTab)}>
            {t.label}
          </NavLink>
        ))}
      </div>
      <div className="flex items-center justify-between p-5 border-b border-brand-border/70">
        <div className="relative w-full max-w-sm">
          <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${type}s...`} className="pl-10 pr-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border w-full focus:outline-none focus:ring-2 focus:ring-brand-indigo text-sm placeholder:text-brand-muted" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
        </div>
        {!hideCreate && <button className="ml-4 btn-pill" onClick={onCreate}><Plus className="w-5 h-5" />Create {type}</button>}
      </div>
      {data.loading && <div className="p-4 text-sm text-brand-muted">Loading...</div>}
      {data.error && <div className="p-4 text-sm text-red-600">{data.error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-brand-muted bg-brand-bg">
            <tr>
              {headers.map(header => (<th key={header} className="px-6 py-3 font-semibold">{header}</th>))}
              <th className="px-6 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} className="bg-white/90 hover:bg-white row-hover border-t border-brand-border/60 transition">
                {renderRow(item).map((cell, i) => (
                  <td key={i} className="px-6 py-4 whitespace-nowrap text-text-primary/90">{typeof cell === 'number' && i === (headers.indexOf('Amount')) ? cell.toLocaleString('en-US',{style:'currency',currency:'USD'}) : cell}</td>
                ))}
                <td className="px-6 py-4">
                  <div className="flex justify-center items-center gap-3">
                    <button onClick={()=>onEdit(item)} className="text-brand-indigo hover:underline text-sm">Edit</button>
                    {(type === 'Customer Invoice' || type === 'Vendor Bill') && (
                      <button onClick={()=>downloadDoc(item)} title="Download PDF" className="p-2 rounded-md border border-brand-border hover:bg-brand-bg">
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && createPortal(
        <EntityModal type={type} data={data} defaultValue={editing} onClose={()=>{ setModalOpen(false); setEditing(null); }} />, document.body)}
    </div>
  );
};
export default GlobalList;

// --- Entity Modal (backend integrated) ---
const EntityModal = ({ type, data, defaultValue, onClose }) => {
  const isExpense = type === 'Expense';
  const isSalesOrder = type === 'Sales Order';
  const isPurchaseOrder = type === 'Purchase Order';
  const isInvoice = type === 'Customer Invoice';
  const isBill = type === 'Vendor Bill';
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(() => {
    if (defaultValue) {
      const initialDate = toDateInputValue(defaultValue.date || defaultValue.orderDate || defaultValue.expected_delivery || defaultValue.createdAt);
      return {
        ...defaultValue,
        date: initialDate,
        partnerId: defaultValue.partnerId ?? '',
        vendorId: defaultValue.vendorId ?? '',
        projectId: defaultValue.projectId ?? (data.projects[0]?.id || ''),
        userId: defaultValue.userId ?? '',
      };
    }
    return {
      projectId: data.projects[0]?.id || '',
      date: toDateInputValue(new Date()),
      amount: 0,
      state: isExpense ? 'pending' : 'draft',
      partnerId: '',
      vendorId: '',
      salesOrderId: '',
      purchaseOrderId: '',
      items: [],
      description: '',
      category: 'General',
      userId: '',
      receipt: null,
    };
  });
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(form.receipt);
  const [receiptUploading, setReceiptUploading] = useState(false);

  const setField = (k,v) => setForm(f => ({ ...f, [k]: v }));
  const total = useMemo(()=> (form.items||[]).reduce((s,i)=> s + (Number(i.qty)||0)*(Number(i.price)||0), 0), [form.items]);
  useEffect(()=> {
    if ((isSalesOrder || isPurchaseOrder) && (form.items && form.items.length > 0)) {
      setField('amount', total);
    }
  }, [total, isSalesOrder, isPurchaseOrder, form.items]);

  const partnerOptions = data.getPartnerByRole('customer');
  const vendorOptions = data.getPartnerByRole('vendor');

  const addLineFromProduct = (product) => {
    setForm(f => ({ ...f, items:[...(f.items||[]), { productId: product.id, name: product.name, qty:1, price: product.price }] }));
  };
  const addEmptyRow = () => setForm(f => ({ ...f, items:[...(f.items||[]), { productId:null, name:'', qty:1, price:0 }] }));
  const updateItem = (idx, next) => setForm(f => ({ ...f, items: f.items.map((it,i)=> i===idx? next: it) }));
  const removeItem = (idx) => setForm(f => ({ ...f, items: f.items.filter((_,i)=> i!==idx) }));

  const onSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      let receiptUrl = form.receipt;
      if (isExpense && receiptFile) {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        if (cloudName && uploadPreset) {
          const fd = new FormData(); fd.append('file', receiptFile); fd.append('upload_preset', uploadPreset);
          const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method:'POST', body: fd });
          const json = await res.json(); if (res.ok) receiptUrl = json.secure_url; else throw new Error(json?.error?.message || 'Receipt upload failed');
        }
      }
      if (isSalesOrder) {
        if (defaultValue) await data.updateSalesOrder(defaultValue.id, { partnerId: form.partnerId, projectId: form.projectId, date: form.date, state: form.state, amount: form.items?.length ? total : (form.amount ?? total) });
        else {
          await data.createSalesOrder({ partnerId: form.partnerId, projectId: form.projectId, date: form.date, state: form.state, amount: form.items?.length ? total : (form.amount ?? total), items: form.items.map(i => ({ id: i.productId, qty: i.qty, price: i.price })) });
        }
      } else if (isPurchaseOrder) {
        if (defaultValue) await data.updatePurchaseOrder(defaultValue.id, { vendorId: form.vendorId, projectId: form.projectId, date: form.date, state: form.state, amount: form.items?.length ? total : (form.amount ?? total) });
        else await data.createPurchaseOrder({ vendorId: form.vendorId, projectId: form.projectId, date: form.date, state: form.state, amount: form.items?.length ? total : (form.amount ?? total), items: form.items.map(i => ({ id: i.productId, qty: i.qty, price: i.price })) });
      } else if (isInvoice) {
        if (!defaultValue) throw new Error('Invoices are created from Sales Orders.');
        await data.updateInvoice(defaultValue.id, { amount: form.amount, state: form.state });
      } else if (isBill) {
        if (!defaultValue) throw new Error('Vendor Bills are created from Purchase Orders.');
        await data.updateVendorBill(defaultValue.id, { amount: form.amount, state: form.state });
      } else if (isExpense) {
        if (defaultValue) await data.updateExpense(defaultValue.id, { amount: form.amount, projectId: form.projectId, userId: form.userId, category: form.category, description: form.description, date: form.date, state: form.state, receipt: receiptUrl });
        else await data.createExpense({ amount: form.amount, projectId: form.projectId, userId: form.userId, category: form.category, description: form.description, date: form.date, state: form.state, receipt: receiptUrl });
      }
      onClose();
    } catch (err) { setError(err.message || String(err)); }
    finally { setSaving(false); }
  };

  // CTA: Create Invoice (from Sales Order) / Create Bill (from PO)
  const [creatingChild, setCreatingChild] = useState(false);
  const onCreateInvoice = async () => {
    if (!defaultValue?.id) return;
    setCreatingChild(true); setError('');
    try {
      const amountToUse = (form.items && form.items.length > 0) ? total : (form.amount ?? defaultValue.amount ?? 0);
      await data.createInvoice({ salesOrderId: defaultValue.id, amount: amountToUse });
      window.alert('Invoice created successfully');
      onClose();
    } catch (e) { setError(e.message || 'Failed to create invoice'); window.alert('Failed to create invoice: ' + (e.message||e)); }
    finally { setCreatingChild(false); }
  };
  const onCreateBill = async () => {
    if (!defaultValue?.id) return;
    setCreatingChild(true); setError('');
    try {
      const amountToUse = (form.items && form.items.length > 0) ? total : (form.amount ?? defaultValue.amount ?? 0);
      const vendorId = form.vendorId || defaultValue.vendorId;
      await data.createVendorBill({ vendorId, purchaseOrderId: defaultValue.id, amount: amountToUse, state: 'pending' });
      window.alert('Vendor bill created successfully');
      onClose();
    } catch (e) { setError(e.message || 'Failed to create bill'); window.alert('Failed to create bill: ' + (e.message||e)); }
    finally { setCreatingChild(false); }
  };

  const ItemRow = ({ idx, item }) => (
    <div className="grid grid-cols-12 gap-2 items-center">
      <select className="col-span-5 px-3 py-2 rounded-xl border border-brand-border" value={item.productId||''} onChange={e=>{
        const product = data.products.find(p => p.id === Number(e.target.value));
        updateItem(idx, { ...item, productId: product?.id || null, name: product?.name || item.name, price: product?.price ?? item.price });
      }}>
        <option value="">Select product...</option>
        {data.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <input type="number" min={1} className="col-span-2 px-3 py-2 rounded-xl border border-brand-border" value={item.qty} onChange={e=>updateItem(idx,{ ...item, qty: Number(e.target.value) })} />
      <input type="number" min={0} className="col-span-3 px-3 py-2 rounded-xl border border-brand-border" value={item.price} onChange={e=>updateItem(idx,{ ...item, price: Number(e.target.value) })} />
      <div className="col-span-2 text-right text-sm text-brand-muted">{(item.qty*item.price||0).toLocaleString('en-US',{style:'currency',currency:'USD'})}</div>
      <button type="button" onClick={()=>removeItem(idx)} className="text-red-500 text-xs">Remove</button>
    </div>
  );

  const statusOptions = isExpense ? ['pending','rejected','approved'] : ['draft','confirmed','paid'];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-elevated overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto p-6">
          <button onClick={onClose} className="absolute top-3 right-3 text-brand-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
          <h3 className="text-lg font-semibold mb-1">{defaultValue? 'Edit':'Create'} {type}</h3>
          {error && <div className="mb-3 text-xs text-red-600">{error}</div>}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!isInvoice && !isBill && (
                <div>
                  <label className="text-xs text-brand-muted">Project</label>
                  <select value={form.projectId ?? ''} onChange={e=>setField('projectId', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border">
                    {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs text-brand-muted">Date</label>
                <div className="relative mt-1">
                  <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input type="date" value={form.date} onChange={e=>setField('date', e.target.value)} className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border" />
                </div>
              </div>
              {isSalesOrder && (
                <div>
                  <label className="text-xs text-brand-muted">Customer</label>
                  <select value={form.partnerId ?? ''} onChange={e=>setField('partnerId', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border">
                    <option value="">Select customer...</option>
                    {partnerOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}
              {isPurchaseOrder && (
                <div>
                  <label className="text-xs text-brand-muted">Vendor</label>
                  <select value={form.vendorId ?? ''} onChange={e=>setField('vendorId', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border">
                    <option value="">Select vendor...</option>
                    {vendorOptions.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
              )}
              {isExpense && (
                <>
                  <div>
                    <label className="text-xs text-brand-muted">Category</label>
                    <input value={form.category} onChange={e=>setField('category', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border" />
                  </div>
                  <div>
                    <label className="text-xs text-brand-muted">Description</label>
                    <input value={form.description} onChange={e=>setField('description', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border" />
                  </div>
                </>
              )}
              <div>
                <label className="text-xs text-brand-muted">Status</label>
                <select value={form.state} onChange={e=>setField('state', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border">
                  {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {(!isSalesOrder && !isPurchaseOrder) && (
                <div>
                  <label className="text-xs text-brand-muted">Amount</label>
                  <div className="relative mt-1">
                    <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input type="number" min={0} value={form.amount} onChange={e=>setField('amount', Number(e.target.value))} className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border" />
                  </div>
                </div>
              )}
            </div>
            {!isExpense && !isInvoice && !isBill && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">Line Items</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={addEmptyRow} className="px-3 py-1.5 rounded-md border border-brand-border text-sm hover:bg-brand-bg flex items-center gap-2"><PackageSearch className="w-4 h-4"/> Add row</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(form.items||[]).map((it, idx) => <ItemRow key={idx} idx={idx} item={it} />)}
                  {!form.items?.length && <div className="text-xs text-brand-muted">No items yet.</div>}
                </div>
                <div className="mt-3 flex justify-end text-sm text-brand-muted">
                  <div className="rounded-xl bg-brand-bg px-3 py-1.5">Subtotal: <span className="font-semibold text-text-primary">{total.toLocaleString('en-US',{style:'currency',currency:'USD'})}</span></div>
                </div>
              </div>
            )}
            {isExpense && (
              <div className="mt-2">
                <label className="text-xs text-brand-muted">Receipt Image</label>
                <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f){ setReceiptFile(f); setReceiptPreview(URL.createObjectURL(f)); } }} className="mt-1 text-xs" />
                {receiptPreview && <img src={receiptPreview} alt="receipt" className="h-20 mt-2 rounded-md border object-cover" />}
              </div>
            )}
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              {isSalesOrder && !!defaultValue?.id && (
                <button type="button" onClick={onCreateInvoice} disabled={creatingChild} className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">{creatingChild? 'Creating...':'Create Invoice'}</button>
              )}
              {isPurchaseOrder && !!defaultValue?.id && (
                <button type="button" onClick={onCreateBill} disabled={creatingChild} className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">{creatingChild? 'Creating...':'Create Bill'}</button>
              )}
              <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">Cancel</button>
              <button type="submit" disabled={saving || receiptUploading} className="btn-pill">{saving? 'Saving...': (defaultValue? 'Save Changes':'Create')}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
