import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { useApi } from '../contexts/ApiContext.jsx';
import { DollarSign, FileText, ShoppingCart, Receipt } from 'lucide-react';
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

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { getProjectById, removeProject } = useData();
  const api = useApi();
  const [activeTab, setActiveTab] = useState('Tasks');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const project = getProjectById(projectId);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { setLoading(true); const s = await api.fetchProjectSummary(projectId); if (mounted) setSummary(s); }
      catch { /* ignore */ } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [api, projectId]);

  if (!project) {
    return <NotFound />;
  }
  
  const profit = (summary?.revenue || 0) - (summary?.cost || 0);

  const tabs = ['Tasks'];

  const handleDelete = () => setConfirmOpen(true);
  const confirmDelete = () => {
    removeProject(project.id);
    setConfirmOpen(false);
    navigate('/projects');
  };

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
                <span>{summary?.progress ?? project.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${summary?.progress ?? project.progress}%` }}></div>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatCard title="Budget" value={(project.budget||0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} icon={<DollarSign size={20}/>} />
            <StatCard title="Revenue" value={(summary?.revenue||0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} icon={<FileText size={20}/>} />
            <StatCard title="Cost" value={(summary?.cost||0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })} icon={<ShoppingCart size={20}/>} />
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
