import React, { useState } from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Plus, Pencil, X, Calendar } from 'lucide-react';
import { createPortal } from 'react-dom';

const ProjectCard = ({ project, onEdit }) => {
  const navigate = useNavigate();
  const profit = project.revenue - project.cost;
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Planned': return 'bg-orange-100 text-orange-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500 shadow-red-500/30';
      case 'Medium': return 'bg-orange-500 shadow-orange-500/30';
      case 'Low': return 'bg-blue-500 shadow-blue-500/30';
      default: return 'bg-gray-400';
    }
  };
  
  return (
    <div 
      className="glass-card card-hoverable p-6"
    >
      <div className="flex justify-between items-start">
        <div className="cursor-pointer" onClick={() => navigate(`/projects/${project.id}`)}>
          <h3 className="text-lg font-semibold tracking-tight">{project.name}</h3>
          <p className="text-sm text-text-secondary mt-1">{project.customer}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full shadow-sm ${getPriorityDot(project.priority)}`} title={`Priority: ${project.priority}`}></span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill ${getStatusColor(project.status)}`}>{project.status}</span>
          <button onClick={()=>onEdit(project)} className="text-brand-muted hover:text-text-primary p-1 rounded-md" title="Edit project">
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-secondary mb-2">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-brand-border/60 overflow-hidden">
          <div className="h-full rounded-full bg-brand-indigo" style={{ width: `${project.progress}%` }}></div>
        </div>
      </div>
      <div className="mt-5 pt-4 border-t border-brand-border/70 grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-text-secondary">Revenue</p>
          <p className="font-semibold text-green-600">{project.revenue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-text-secondary">Cost</p>
          <p className="font-semibold text-red-600">{project.cost.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-text-secondary">Profit</p>
          <p className={`font-semibold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{profit.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}</p>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const { projects, users } = useData();
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const filteredProjects = projects.filter(p => filter === 'All' || p.status === filter);
  const filters = ['All', 'Planned', 'In Progress', 'Completed', 'On Hold'];

  return (
    <div className="mount">
      <div className="flex justify-between items-center mb-8">
        <div className="flex flex-wrap gap-2 bg-secondary/60 p-1.5 rounded-xl">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${filter === f ? 'bg-white text-text-primary shadow-soft' : 'text-text-secondary hover:text-text-primary'}`}>{f}</button>
          ))}
        </div>
        <button className="btn-pill" onClick={()=>{ setEditing(null); setModalOpen(true); }}><Plus className="w-4 h-4" /> Create Project</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} onEdit={(p)=>{ setEditing(p); setModalOpen(true); }} />
        ))}
      </div>

      {modalOpen && createPortal(
        <ProjectModal onClose={()=>{ setModalOpen(false); setEditing(null); }} defaultValue={editing} />, document.body
      )}
    </div>
  );
};

export default Projects;

const ProjectModal = ({ onClose, defaultValue }) => {
  const { users, upsertProject, removeProject } = useData();
  const isEditing = !!defaultValue;
  const [form, setForm] = useState(() => {
    if (isEditing) {
      return {
        ...defaultValue,
        // Provide missing fields with safe defaults
        tags: Array.isArray(defaultValue.tags) ? defaultValue.tags : [],
        managerId: defaultValue.managerId || users.find(u => u.name === defaultValue.manager)?.id || users[0]?.id || '',
        priority: defaultValue.priority || 'Medium',
        image: defaultValue.image || null,
        description: defaultValue.description || '',
        deadline: defaultValue.deadline || new Date().toISOString().slice(0,10),
        status: defaultValue.status || 'Planned',
        progress: defaultValue.progress ?? 0,
        revenue: defaultValue.revenue ?? 0,
        cost: defaultValue.cost ?? 0,
      };
    }
    return {
      name: '',
      customer: '',
      managerId: users[0]?.id || '',
      deadline: new Date().toISOString().slice(0,10),
      priority: 'Medium',
      tags: [],
      image: null,
      description: '',
      status: 'Planned',
      progress: 0,
      revenue: 0,
      cost: 0,
    };
  });

  const setField = (k,v) => setForm(prev => ({ ...prev, [k]: v }));
  const toggleTag = (t) => setField('tags', form.tags.includes(t) ? form.tags.filter(x=>x!==t) : [...form.tags, t]);
  const [newTag, setNewTag] = useState('');
  const addTag = () => { const t = newTag.trim(); if(!t) return; if(!form.tags.includes(t)) setField('tags', [...form.tags, t]); setNewTag(''); };

  const handleImage = (e) => {
    const file = e.target.files?.[0]; if(!file) return; const r=new FileReader(); r.onload=()=> setField('image', r.result); r.readAsDataURL(file);
  };

  const save = (e) => {
    e.preventDefault();
    upsertProject(form);
    onClose();
  };

  const doDelete = () => {
    if (!defaultValue) return;
    setConfirmOpen(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmDelete = () => {
    removeProject(defaultValue.id);
    setConfirmOpen(false);
    onClose();
  };

  const priorityOpts = ['Low','Medium','High'];
  const statusOpts = ['Planned','In Progress','Completed','On Hold'];

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-elevated overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto p-6">
         {/* <button onClick={onClose} className="absolute top-3 right-3 text-brand-muted hover:text-text-primary"><X className="w-5 h-5" /></button> */}
         <div className="flex items-center justify-between mb-4">
           <h3 className="text-lg font-semibold">{isEditing? 'Edit Project' : 'Create Project'}</h3>
           <div className="flex gap-2">
             {isEditing && <button onClick={doDelete} type="button" className="px-3 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50">Delete</button>}
             <button onClick={onClose} type="button" className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">Discard</button>
             <button onClick={save} type="button" className="btn-pill">Save</button>
           </div>
         </div>

         <form onSubmit={save} className="space-y-4">
          <div>
            <label className="text-xs text-brand-muted">Project Name</label>
            <input value={form.name} onChange={e=>setField('name', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" placeholder="Enter project name" />
          </div>
          {/* Customer field removed as requested */}
          <div>
            <label className="text-xs text-brand-muted">Tags</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {(form.tags || []).map(t => (
                <span key={t} className="px-2 py-1 rounded-full bg-brand-indigo/10 text-brand-indigo text-xs">{t}</span>
              ))}
              <div className="flex items-center gap-2">
                <input value={newTag} onChange={e=>setNewTag(e.target.value)} className="px-2 py-1 rounded-md border border-brand-border text-sm" placeholder="Add tag" />
                <button type="button" onClick={addTag} className="px-2 py-1 rounded-md border border-brand-border text-sm hover:bg-brand-bg">Add</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-brand-muted">Project Manager</label>
              <select value={form.managerId} onChange={e=>setField('managerId', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40">
                {users.map(u => (<option key={u.id} value={u.id}>{u.name}</option>))}
              </select>
            </div>
            <div>
              <label className="text-xs text-brand-muted">Deadline</label>
              <div className="relative mt-1">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input type="date" value={form.deadline} onChange={e=>setField('deadline', e.target.value)} className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-brand-muted">Priority</label>
            <div className="mt-1 flex items-center gap-6 text-sm">
              {priorityOpts.map(p => (
                <label key={p} className="flex items-center gap-2">
                  <input type="radio" name="priority" checked={form.priority===p} onChange={()=>setField('priority', p)} /> {p}
                </label>
              ))}
            </div>
          </div>

          {/* New: Status selection */}
          <div>
            <label className="text-xs text-brand-muted">Status</label>
            <div className="mt-1 flex flex-wrap gap-6 text-sm">
              {statusOpts.map(s => (
                <label key={s} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="status"
                    checked={form.status===s}
                    onChange={()=>{
                      setField('status', s);
                      if (s === 'Completed' && (form.progress||0) < 100) {
                        setField('progress', 100);
                      }
                    }}
                  /> {s}
                </label>
              ))}
            </div>
            {form.status === 'Completed' && form.progress < 100 && (
              <p className="mt-1 text-[11px] text-brand-muted">Progress set to 100% on completion.</p>
            )}
          </div>

          <div>
            <label className="text-xs text-brand-muted">Image</label>
            <div className="mt-1 flex items-center gap-2">
              <input type="file" accept="image/*" onChange={handleImage} className="text-xs" />
              {form.image && <img src={form.image} alt="project" className="h-14 rounded-md border" />}
            </div>
          </div>

          <div>
            <label className="text-xs text-brand-muted">Description</label>
            <textarea value={form.description} onChange={e=>setField('description', e.target.value)} rows={5} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border" placeholder="Project description" />
          </div>
        </form>
        </div>
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
