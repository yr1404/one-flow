import React, { useMemo, useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { Plus, Search, X, Calendar, DollarSign, User, FileText, Building2, PackageSearch, Image as ImageIcon, Download } from 'lucide-react';
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

const GlobalList = ({ type }) => {
  const data = useData();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const listDataMap = {
    'Sales Order': data.salesOrders,
    'Purchase Order': data.purchaseOrders,
    'Customer Invoice': data.customerInvoices,
    'Vendor Bill': data.vendorBills,
    'Expense': data.expenses,
  };
  
  const headersMap = {
    'Sales Order': ['Number', 'Project', 'Customer', 'Date', 'Amount', 'Status'],
    'Purchase Order': ['Number', 'Project', 'Vendor', 'Date', 'Amount', 'Status'],
    'Customer Invoice': ['Number', 'Project', 'Customer', 'Date', 'Amount', 'Status'],
    'Vendor Bill': ['Number', 'Project', 'Vendor', 'Date', 'Amount', 'Status'],
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
      case 'Sales Order': return [item.number, data.getProjectById(item.projectId)?.name, item.customer, item.date, item.amount, item.state];
      case 'Purchase Order': return [item.number, data.getProjectById(item.projectId)?.name, item.vendor, item.date, item.amount, item.state];
      case 'Customer Invoice': return [item.number, data.getProjectById(item.projectId)?.name, item.customer, item.date, item.amount, item.state];
      case 'Vendor Bill': return [item.number, data.getProjectById(item.projectId)?.name, item.vendor, item.date, item.amount, item.state];
      case 'Expense': return [item.number, data.getProjectById(item.projectId)?.name, item.employee, item.date, item.amount, item.description, item.state];
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

  // Cache for base64 logo to avoid repeated fetch/encoding
  let cachedLogoDataUrl = null;

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
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-4 pb-2 border-b border-brand-border/60">
        {tabItems.map(t => (
          <NavLink
            key={t.path}
            to={t.path}
            className={({ isActive }) => (isActive || t.type === type ? activeTab : inactiveTab)}
          >
            {t.label}
          </NavLink>
        ))}
      </div>
      <div className="flex items-center justify-between p-5 border-b border-brand-border/70">
        <div className="relative w-full max-w-sm">
          <input 
            type="text" 
            value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder={`Search ${type}s...`}
            className="pl-10 pr-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border w-full focus:outline-none focus:ring-2 focus:ring-brand-indigo text-sm placeholder:text-brand-muted"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
        </div>
        {!hideCreate && (
          <button className="ml-4 btn-pill" onClick={onCreate}>
            <Plus className="w-5 h-5" />
            Create {type}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase text-brand-muted bg-brand-bg">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="px-6 py-3 font-semibold">{header}</th>
              ))}
              <th className="px-6 py-3 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="bg-white/90 hover:bg-white row-hover border-t border-brand-border/60 transition">
                {renderRow(item).map((cell, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap text-text-primary/90">
                    {typeof cell === 'number' ? cell.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : cell}
                  </td>
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

      {/* Modal for Create/Edit */}
      {modalOpen && createPortal(
        <EntityModal 
          type={type}
          data={data}
          defaultValue={editing}
          onClose={()=>{ setModalOpen(false); setEditing(null); }}
          onOpenProductPicker={()=>setProductPickerOpen(true)}
        />, document.body)}

      {/* Add Product Popup */}
      {productPickerOpen && createPortal(
        <AddProductModal onClose={()=>setProductPickerOpen(false)} />,
        document.body
      )}
    </div>
  );
};

export default GlobalList;

// --- Entity Create/Edit Modal ---
const EntityModal = ({ type, data, defaultValue, onClose, onOpenProductPicker }) => {
  const isExpense = type === 'Expense';
  const isSalesOrder = type === 'Sales Order';
  const isPurchaseOrder = type === 'Purchase Order';
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState(sampleProducts);
  const [form, setForm] = useState(() => defaultValue || {
    projectId: data.projects[0]?.id || '',
    date: new Date().toISOString().slice(0,10),
    amount: defaultValue?.amount || 0,
    state: isExpense ? 'Pending' : 'Draft',
    customer: (isSalesOrder || type === 'Customer Invoice') ? (defaultValue?.customer||'') : undefined,
    vendor: (isPurchaseOrder || type === 'Vendor Bill') ? (defaultValue?.vendor||'') : undefined,
    employee: isExpense ? (defaultValue?.employee||'') : undefined,
    description: isExpense ? (defaultValue?.description||'') : undefined,
    items: defaultValue?.items || [],
    receipt: defaultValue?.receipt || null,
  });

  const setField = (k,v) => setForm(prev => ({ ...prev, [k]: v }));

  const total = useMemo(()=> (form.items||[]).reduce((s,i)=> s + (i.qty*i.price||0), 0), [form.items]);
  // Auto-bind for Sales & Purchase Orders
  useEffect(()=> { if (isSalesOrder || isPurchaseOrder) setField('amount', total); }, [total, isSalesOrder, isPurchaseOrder]);

  // Handle Sales Order confirmation -> decrement inventory with low-stock prompt
  const onStatusChange = (next) => {
    if (next === 'Confirmed' && isSalesOrder) {
      // Aggregate required quantities by product id
      const needByProduct = (form.items||[]).reduce((acc, it) => {
        if (!it.id) return acc; // rows without product linkage are ignored for stock
        acc[it.id] = (acc[it.id]||0) + (Number(it.qty)||0);
        return acc;
      }, {});
      const shortages = Object.entries(needByProduct).map(([pid, qty]) => {
        const p = products.find(pp => pp.id === pid);
        const available = p?.quantityAvailable ?? 0;
        return qty > available ? { name: p?.name||pid, qty, available } : null;
      }).filter(Boolean);

      if (shortages.length) {
        const msg = 'Insufficient stock for:\n' + shortages.map(s=>`• ${s.name}: need ${s.qty}, available ${s.available}`).join('\n') + '\n\nProceed anyway?';
        const proceed = window.confirm(msg);
        if (!proceed) {
          return; // do not change state
        }
      }
      // Decrement inventory (do not go below 0)
      setProducts(list => list.map(p => {
        const qtyNeeded = needByProduct[p.id]||0;
        if (!qtyNeeded) return p;
        const available = p.quantityAvailable ?? 0;
        const nextAvail = Math.max(0, available - qtyNeeded);
        return { ...p, quantityAvailable: nextAvail };
      }));
    }
    setField('state', next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    data.upsertEntity(type, { ...form, amount: (isSalesOrder || isPurchaseOrder) ? total : form.amount });
    onClose();
  };

  // Add product from product picker into current form items
  const onAddProduct = (product) => {
    if (!product) return;
    setForm(f => ({
      ...f,
      items: [...(f.items||[]), { id: product.id, name: product.name, qty: 1, price: product.price }]
    }));
    setShowProducts(false);
  };

  const createInvoiceFromOrder = () => {
    if (!isSalesOrder) return;
    data.upsertEntity('Customer Invoice', {
      projectId: form.projectId,
      date: new Date().toISOString().slice(0,10),
      amount: total,
      state: 'Draft',
      customer: form.customer || '',
      items: form.items || [],
      sourceSalesOrderId: form.id || defaultValue?.id || null,
    });
    window.alert('Invoice created.');
  };

  const createBillFromPO = () => {
    if (!isPurchaseOrder) return;
    data.upsertEntity('Vendor Bill', {
      projectId: form.projectId,
      date: new Date().toISOString().slice(0,10),
      amount: total,
      state: 'Draft',
      vendor: form.vendor || '',
      items: form.items || [],
      sourcePurchaseOrderId: form.id || defaultValue?.id || null,
    });
    window.alert('Vendor bill created.');
  };

  const headerIcon = () => {
    switch(type){
      case 'Sales Order': return <FileText className="w-4 h-4"/>;
      case 'Purchase Order': return <Building2 className="w-4 h-4"/>;
      case 'Customer Invoice': return <FileText className="w-4 h-4"/>;
      case 'Vendor Bill': return <Building2 className="w-4 h-4"/>;
      case 'Expense': return <User className="w-4 h-4"/>;
      default: return null;
    }
  };

  const ItemRow = ({ idx, item, onChange, onRemove }) => (
    <div className="grid grid-cols-12 gap-2 items-center">
      <input className="col-span-5 px-3 py-2 rounded-xl border border-brand-border" placeholder="Product name" value={item.name} onChange={e=>onChange({ ...item, name: e.target.value })}/>
      <input className="col-span-2 px-3 py-2 rounded-xl border border-brand-border" placeholder="Qty" type="number" min={1} value={item.qty} onChange={e=>onChange({ ...item, qty: Number(e.target.value) })}/>
      <input className="col-span-3 px-3 py-2 rounded-xl border border-brand-border" placeholder="Unit Price" type="number" min={0} value={item.price} onChange={e=>onChange({ ...item, price: Number(e.target.value) })}/>
      <div className="col-span-2 text-right text-sm text-brand-muted">
        {(item.qty*item.price||0).toLocaleString('en-US',{style:'currency',currency:'USD'})}
      </div>
      <button type="button" onClick={onRemove} className="text-red-500 text-xs">Remove</button>
    </div>
  );

  const statusOptions = isExpense ? ['Pending','Rejected','Approved'] : (isSalesOrder || isPurchaseOrder) ? ['Draft','Confirmed','Paid'] : ['Draft','Confirmed','Paid','Approved'];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-elevated overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto p-6">
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-muted hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 mb-1">
          <div className="icon-ring">{headerIcon()}</div>
          <h3 className="text-lg font-semibold">{defaultValue ? 'Edit' : 'Create'} {type}</h3>
        </div>
        <p className="text-sm text-brand-muted mb-4">Fill in the {type.toLowerCase()} details below.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-brand-muted">Project</label>
              <select value={form.projectId} onChange={e=>setField('projectId', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40">
                {data.projects.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-brand-muted">Date</label>
              <div className="relative mt-1">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input value={form.date} onChange={e=>setField('date', e.target.value)} type="date" className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
              </div>
            </div>
            {(isSalesOrder || type === 'Customer Invoice') && (
              <div>
                <label className="text-xs text-brand-muted">Customer</label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input value={form.customer||''} onChange={e=>setField('customer', e.target.value)} placeholder="Customer name" className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
              </div>
            )}
            {(isPurchaseOrder || type === 'Vendor Bill') && (
              <div>
                <label className="text-xs text-brand-muted">Vendor</label>
                <div className="relative mt-1">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input value={form.vendor||''} onChange={e=>setField('vendor', e.target.value)} placeholder="Vendor name" className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
              </div>
            )}
            {isExpense && (
              <>
                <div>
                  <label className="text-xs text-brand-muted">Employee</label>
                  <div className="relative mt-1">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input value={form.employee||''} onChange={e=>setField('employee', e.target.value)} placeholder="Employee name" className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-brand-muted">Description</label>
                  <input value={form.description||''} onChange={e=>setField('description', e.target.value)} placeholder="What was this expense for?" className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-brand-muted">Receipt Image</label>
                  <div className="mt-1 flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={e=>{ const file = e.target.files?.[0]; if(!file) return; const reader = new FileReader(); reader.onload= () => setField('receipt', reader.result); reader.readAsDataURL(file); }} className="text-xs" />
                    {form.receipt && <img src={form.receipt} alt="receipt" className="h-14 rounded-md border" />}
                  </div>
                </div>
              </>
            )}
            <div>
              <label className="text-xs text-brand-muted">Status</label>
              <select value={form.state} onChange={e=>onStatusChange(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40">
                {statusOptions.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            {(!isSalesOrder && !isPurchaseOrder && !isExpense) && (
              <div>
                <label className="text-xs text-brand-muted">Amount</label>
                <div className="relative mt-1">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input value={form.amount} onChange={e=>setField('amount', Number(e.target.value))} type="number" min={0} className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
              </div>
            )}
            {isExpense && (
              <div>
                <label className="text-xs text-brand-muted">Amount</label>
                <div className="relative mt-1">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                  <input value={form.amount} onChange={e=>setField('amount', Number(e.target.value))} type="number" min={0} className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
                </div>
              </div>
            )}
          </div>

          {/* Line items block (non-expense entities) */}
          {type !== 'Expense' && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Line Items</div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={()=>setShowProducts(true)} className="px-3 py-1.5 rounded-md border border-brand-border text-sm hover:bg-brand-bg flex items-center gap-2">
                    <PackageSearch className="w-4 h-4"/> Add a product
                  </button>
                  <button type="button" onClick={()=> setForm(f=>({ ...f, items:[...(f.items||[]), { id: crypto.randomUUID?.()||Math.random().toString(36).slice(2), name:'', qty:1, price:0 }] }))} className="px-3 py-1.5 rounded-md border border-brand-border text-sm hover:bg-brand-bg">Add row</button>
                </div>
              </div>
              <div className="space-y-2">
                {(form.items||[]).map((it, idx) => (
                  <ItemRow
                    key={it.id||idx}
                    idx={idx}
                    item={it}
                    onChange={(next)=> setForm(f=> ({...f, items: f.items.map((ii,i)=> i===idx? next: ii)}))}
                    onRemove={()=> setForm(f=> ({...f, items: f.items.filter((_,i)=> i!==idx)}))}
                  />
                ))}
                {!form.items?.length && (
                  <div className="text-xs text-brand-muted">No items yet.</div>
                )}
              </div>
              <div className="mt-3 flex justify-end text-sm text-brand-muted">
                <div className="rounded-xl bg-brand-bg px-3 py-1.5">
                  Subtotal: <span className="font-semibold text-text-primary">{total.toLocaleString('en-US',{style:'currency',currency:'USD'})}</span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {(isSalesOrder) && <button type="button" onClick={createInvoiceFromOrder} className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">Create Invoice</button>}
            {(isPurchaseOrder) && <button type="button" onClick={createBillFromPO} className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">Create Bill</button>}
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">Cancel</button>
            <button type="submit" className="btn-pill">{defaultValue? 'Save Changes' : 'Create'}</button>
          </div>
        </form>

        {showProducts && createPortal(<AddProductModal products={products} setProducts={setProducts} onAdd={onAddProduct} onClose={()=>setShowProducts(false)} />, document.body)}
        </div>
      </div>
    </div>
  );
};

// --- Add Product Modal with create/edit ---
const AddProductModal = ({ onClose, onAdd, products, setProducts }) => {
  const [query, setQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [prodForm, setProdForm] = useState({
    name:'',
    quantityAvailable: 0,
    createdAt: new Date().toISOString().slice(0,10),
    salesPrice:0,
    salesTaxes:0,
    cost:0,
  });

  const filtered = useMemo(()=> products.filter(p=> p.name.toLowerCase().includes(query.toLowerCase())), [products, query]);

  const openNew = () => {
    setEditing(null);
    setProdForm({ name:'', quantityAvailable:0, createdAt:new Date().toISOString().slice(0,10), salesPrice:0, salesTaxes:0, cost:0 });
    setEditorOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setProdForm({
      name:p.name,
      quantityAvailable: p.quantityAvailable ?? 0,
      createdAt: p.createdAt || new Date().toISOString().slice(0,10),
      salesPrice:p.price ?? 0,
      salesTaxes:p.salesTaxes||0,
      cost:p.cost||0,
    });
    setEditorOpen(true);
  };

  const saveProduct = () => {
    if (!prodForm.name.trim()) return;
    if (editing) {
      setProducts(list => list.map(p => p.id === editing.id ? {
        ...p,
        name: prodForm.name,
        price: Number(prodForm.salesPrice)||0,
        salesTaxes: Number(prodForm.salesTaxes)||0,
        cost: Number(prodForm.cost)||0,
        quantityAvailable: Number(prodForm.quantityAvailable)||0,
        createdAt: prodForm.createdAt,
      } : p));
    } else {
      const id = 'p-' + (Math.random().toString(36).slice(2));
      setProducts(list => [...list, {
        id,
        sku: prodForm.name.toUpperCase().replace(/\s+/g,'-').slice(0,12),
        name: prodForm.name,
        price: Number(prodForm.salesPrice)||0,
        salesTaxes: Number(prodForm.salesTaxes)||0,
        cost: Number(prodForm.cost)||0,
        quantityAvailable: Number(prodForm.quantityAvailable)||0,
        createdAt: prodForm.createdAt,
      }]);
    }
    setEditorOpen(false); setEditing(null);
  };

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-elevated p-6 max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 text-brand-muted hover:text-text-primary"><X className="w-5 h-5" /></button>
        {!editorOpen && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><div className="icon-ring"><PackageSearch className="w-4 h-4"/></div><h3 className="text-lg font-semibold">Add a product</h3></div>
              <button onClick={openNew} className="px-2 py-1 rounded-md border border-brand-border hover:bg-brand-bg text-sm flex items-center gap-1"><Plus className="w-4 h-4"/> New</button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted"/>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search products..." className="pl-9 pr-3 py-2 w-full rounded-xl border border-brand-border"/>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-brand-border/60">
              {filtered.map(p => {
                const out = (p.quantityAvailable ?? 0) <= 0;
                return (
                  <div key={p.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium flex items-center gap-2">{p.name}<button type="button" onClick={()=>openEdit(p)} className="text-xs text-brand-indigo underline">Edit</button></div>
                      <div className="text-xs text-brand-muted">{p.sku} • {p.price.toLocaleString('en-US',{style:'currency',currency:'USD'})} • {(p.quantityAvailable??0)} in stock</div>
                    </div>
                    <button className={`btn-pill ${out? 'opacity-50 pointer-events-none' : ''}`} type="button" onClick={()=>onAdd(p)} disabled={out}>{out? 'Out of stock' : 'Add'}</button>
                  </div>
                );
              })}
              {!filtered.length && (<div className="text-sm text-brand-muted py-6 text-center">No products found.</div>)}
            </div>
          </>
        )}
        {editorOpen && (
          <div>
            <h3 className="text-lg font-semibold mb-4">{editing? 'Edit Product' : 'New Product'}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-brand-muted">Product name</label>
                <input value={prodForm.name} onChange={e=>setProdForm(f=>({...f,name:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-brand-muted">Quantity Available</label>
                  <input type="number" min={0} value={prodForm.quantityAvailable} onChange={e=>setProdForm(f=>({...f,quantityAvailable:Number(e.target.value)}))} className="mt-1 w-full px-3 py-2 rounded-xl border border-brand-border" />
                </div>
                <div>
                  <label className="text-xs text-brand-muted">Created At</label>
                  <input type="date" value={prodForm.createdAt} onChange={e=>setProdForm(f=>({...f,createdAt:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded-xl border border-brand-border" />
                </div>
                <div>
                  <label className="text-xs text-brand-muted">Sales price</label>
                  <input type="number" min={0} value={prodForm.salesPrice} onChange={e=>setProdForm(f=>({...f,salesPrice:Number(e.target.value)}))} className="mt-1 w-full px-3 py-2 rounded-xl border border-brand-border" />
                </div>
                <div>
                  <label className="text-xs text-brand-muted">Sales Taxes</label>
                  <input type="number" min={0} value={prodForm.salesTaxes} onChange={e=>setProdForm(f=>({...f,salesTaxes:Number(e.target.value)}))} className="mt-1 w-full px-3 py-2 rounded-xl border border-brand-border" />
                </div>
                <div>
                  <label className="text-xs text-brand-muted">Cost</label>
                  <input type="number" min={0} value={prodForm.cost} onChange={e=>setProdForm(f=>({...f,cost:Number(e.target.value)}))} className="mt-1 w-full px-3 py-2 rounded-xl border border-brand-border" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button type="button" onClick={()=>{ setEditorOpen(false); setEditing(null); }} className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">Cancel</button>
                <button type="button" onClick={saveProduct} className="btn-pill">Save Product</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock product catalog (for UI only)
const sampleProducts = [
  { id:'p-001', sku:'CONSULT-STD', name:'Consulting - Standard Hour', price:150, salesTaxes:0, cost:0, quantityAvailable: 50, createdAt: new Date().toISOString().slice(0,10) },
  { id:'p-002', sku:'UX-WIRE', name:'UX Wireframing Package', price:2000, salesTaxes:0, cost:0, quantityAvailable: 10, createdAt: new Date().toISOString().slice(0,10) },
  { id:'p-003', sku:'HOST-CLD', name:'Cloud Hosting (Monthly)', price:500, salesTaxes:0, cost:0, quantityAvailable: 20, createdAt: new Date().toISOString().slice(0,10) },
  { id:'p-004', sku:'DEV-FRONT', name:'Frontend Development Sprint', price:6000, salesTaxes:0, cost:0, quantityAvailable: 5, createdAt: new Date().toISOString().slice(0,10) },
  { id:'p-005', sku:'DEV-BACK', name:'Backend API Sprint', price:6500, salesTaxes:0, cost:0, quantityAvailable: 3, createdAt: new Date().toISOString().slice(0,10) },
];
