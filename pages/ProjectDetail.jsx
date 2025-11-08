import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { DollarSign, FileText, ShoppingCart, Receipt, Building } from 'lucide-react';
import Tasks from './Tasks.jsx';
import NotFound from './NotFound.jsx';

const StatCard = ({ title, value, icon }) => (
    <div className="stat-card card-hoverable">
        <div className="icon-ring">{icon}</div>
        <div>
            <p className="stat-label">{title}</p>
            <p className="text-lg font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const DocSection = ({ title, items, showHeader = false }) => (
  <div>
    {showHeader && (
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold">{title}</h4>
        <span className="text-xs px-2 py-1 rounded-full bg-brand-indigo/10 text-brand-indigo">{items.length}</span>
      </div>
    )}
    {items.length === 0 ? (
      <p className="text-xs text-text-secondary">No linked {title.toLowerCase()}.</p>
    ) : (
      <ul className="divide-y divide-brand-border border border-brand-border rounded-xl overflow-hidden bg-white/60 backdrop-blur-xs">
        {items.map(doc => (
          <li key={doc.id} className="px-3 py-2 text-xs flex justify-between gap-4">
            <span className="font-medium truncate" title={doc.number}>{doc.number}</span>
            <span className="text-text-secondary flex items-center gap-3">
              {doc.amount !== undefined && <span>{doc.amount.toLocaleString('en-US',{ style:'currency', currency:'USD', minimumFractionDigits:0 })}</span>}
              <span>{doc.date}</span>
            </span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProjectById, removeProject, salesOrders, purchaseOrders, customerInvoices, vendorBills, expenses } = useData();
  const [activeTab, setActiveTab] = useState('Tasks');
  const [settingsTab, setSettingsTab] = useState('Sales Orders');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const project = getProjectById(projectId);

  if (!project) {
    return <NotFound />;
  }
  
  const profit = project.revenue - project.cost;

  const tabs = ['Tasks', 'Settings'];

  const handleDelete = () => setConfirmOpen(true);
  const confirmDelete = () => {
    removeProject(project.id);
    setConfirmOpen(false);
    navigate('/projects');
  };

  const projectSalesOrders = (salesOrders||[]).filter(o=>o.projectId === project.id);
  const projectPurchaseOrders = (purchaseOrders||[]).filter(o=>o.projectId === project.id);
  const projectCustomerInvoices = (customerInvoices||[]).filter(o=>o.projectId === project.id);
  const projectVendorBills = (vendorBills||[]).filter(o=>o.projectId === project.id);
  const projectExpenses = (expenses||[]).filter(o=>o.projectId === project.id);

  const settingsTabs = [
    { key:'Sales Orders', count: projectSalesOrders.length },
    { key:'Purchase Orders', count: projectPurchaseOrders.length },
    { key:'Customer Invoices', count: projectCustomerInvoices.length },
    { key:'Vendor Bills', count: projectVendorBills.length },
    { key:'Expenses', count: projectExpenses.length },
  ];

  return (
    <div className="space-y-8 mount">
      <div className="glass-card p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">{project.name}</h2>
            <p className="text-text-secondary mt-1">{project.customer}</p>
          </div>
          <div className="text-right space-y-2">
             <div>
               <p className="text-sm text-text-secondary">Deadline</p>
               <p className="font-semibold">{new Date(project.deadline).toLocaleDateString()}</p>
             </div>
             <button onClick={handleDelete} className="px-3 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50 text-sm">Delete Project</button>
          </div>
        </div>
        <div className="mt-4">
            <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Budget Progress</span>
                <span>{project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard title="Budget" value={project.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} icon={<DollarSign size={20}/>} />
            <StatCard title="Revenue" value={project.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} icon={<FileText size={20}/>} />
            <StatCard title="Cost" value={project.cost.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} icon={<ShoppingCart size={20}/>} />
            <StatCard title="Profit" value={profit.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} icon={<Receipt size={20}/>} />
        </div>
      </div>
      
      <div className="glass-card p-2 flex justify-between items-center">
        <div className="flex space-x-2 overflow-x-auto">
            {tabs.map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-lg ${activeTab === tab ? 'bg-brand-indigo text-white shadow-soft' : 'text-text-secondary hover:bg-white/70'}`}>
                    {tab}
                 </button>
            ))}
        </div>
      </div>

      <div>
        {activeTab === 'Tasks' && <Tasks projectId={projectId} />}
        {activeTab === 'Settings' && (
          <div className="space-y-4">
            <div className="glass-card p-2 flex items-center gap-2 overflow-x-auto">
              {settingsTabs.map(t => (
                <button key={t.key} onClick={()=>setSettingsTab(t.key)} className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap flex items-center gap-2 ${settingsTab===t.key? 'bg-brand-indigo text-white shadow-soft' : 'text-text-secondary hover:bg-white/70'}`}>
                  <span>{t.key}</span>
                  <span className={`${settingsTab===t.key? 'bg-white/20 text-white' : 'bg-brand-indigo/10 text-brand-indigo'} text-[10px] px-1.5 py-0.5 rounded-full`}>{t.count}</span>
                </button>
              ))}
            </div>
            <div className="glass-card p-6">
              {settingsTab === 'Sales Orders' && <DocSection title="Sales Orders" items={projectSalesOrders} />}
              {settingsTab === 'Purchase Orders' && <DocSection title="Purchase Orders" items={projectPurchaseOrders} />}
              {settingsTab === 'Customer Invoices' && <DocSection title="Customer Invoices" items={projectCustomerInvoices} />}
              {settingsTab === 'Vendor Bills' && <DocSection title="Vendor Bills" items={projectVendorBills} />}
              {settingsTab === 'Expenses' && <DocSection title="Expenses" items={projectExpenses} />}
            </div>
          </div>
        )}
      </div>

      {confirmOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={()=>setConfirmOpen(false)} />
          <div className="relative bg-white rounded-xl p-6 w-full max-w-sm shadow-elevated max-h-[85vh] overflow-y-auto">
            <h4 className="text-lg font-semibold mb-2">Delete Project?</h4>
            <p className="text-sm text-text-secondary mb-4">This will permanently remove the project and all related tasks & financial documents. This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={()=>setConfirmOpen(false)} className="px-3 py-2 rounded-lg border border-brand-border text-text-primary hover:bg-brand-bg">Cancel</button>
              <button onClick={confirmDelete} className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetail;
