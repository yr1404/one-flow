import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useData } from '../contexts/DataContext.jsx';
import { MoreHorizontal, ChevronDown, Filter, Plus, X, Calendar, User as UserIcon, Tag, Clock } from 'lucide-react';

const TaskCard = ({ task, users, onDragStart, onEdit, onAssign }) => {
  const assignees = Array.isArray(task.assignees) ? task.assignees : (task.assignee ? [task.assignee] : []);
  const [assignOpen, setAssignOpen] = useState(false);
  const menuRef = useRef(null);
  const cardRef = useRef(null);
  const anchorRef = useRef(null);
  const [assignPos, setAssignPos] = useState(null);

  useEffect(() => {
    const onClick = (e) => {
      if (!assignOpen) return;
      if (!menuRef.current?.contains(e.target) && !cardRef.current?.contains(e.target)) setAssignOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, [assignOpen]);

  useLayoutEffect(() => {
    if (assignOpen && anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect();
      setAssignPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX });
    }
  }, [assignOpen]);

  useEffect(() => {
    if (!assignOpen) return;
    const update = () => {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setAssignPos({ top: r.bottom + window.scrollY + 6, left: r.left + window.scrollX });
    };
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [assignOpen]);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-orange-500';
      case 'Low': return 'border-l-blue-500';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <div 
      ref={cardRef}
      className={`rounded-xl glass-card card-hoverable p-4 mb-4 relative overflow-hidden`}
      draggable
      onDragStart={(e) => onDragStart(e, task)}
    > 
      {/* Priority accent bar */}
      <span className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${getPriorityColor(task.priority).replace('border-l-','bg-')}`}></span>
      <div className="flex justify-between items-center">
        <h4 className="font-medium text-sm tracking-tight truncate" title={task.title}>{task.title}</h4>
        <button className="text-brand-muted hover:text-text-primary transition" onClick={() => onEdit(task)}>
            <MoreHorizontal size={18} />
        </button>
      </div>
      <div className="flex justify-between items-end mt-3 text-xs text-brand-muted">
        <div>Due: {new Date(task.dueDate).toLocaleDateString()}</div>
        <div className="relative flex items-center">
          <button
            ref={anchorRef}
            type="button"
            onClick={(e)=>{ e.stopPropagation(); setAssignOpen(o=>!o); }}
            title={assignees.length ? `Assigned to ${assignees.length} user(s)` : 'Assign task'}
            className="flex items-center -space-x-2 py-1 pl-2 pr-3 rounded-full bg-white/80 backdrop-blur-xs ring-1 ring-brand-border hover:ring-brand-indigo/40 transition shadow-innerGlow"
          >
            {!assignees.length && (
              <span className="w-7 h-7 rounded-full flex items-center justify-center bg-brand-bg text-brand-muted">
                <UserIcon className="w-4 h-4" />
              </span>
            )}
            {assignees.slice(0,3).map(uid => {
              const u = users.find(x => x.id === uid);
              return u ? <img key={uid} src={u.avatar} alt={u.name} title={u.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-white" /> : null;
            })}
            {assignees.length > 3 && (
              <span className="w-7 h-7 rounded-full bg-slate-800 text-white text-[11px] font-semibold flex items-center justify-center ring-2 ring-white">+{assignees.length - 3}</span>
            )}
          </button>
          {assignOpen && assignPos && createPortal(
            <div ref={menuRef} style={{ position: 'fixed', top: assignPos.top, left: assignPos.left, zIndex: 9999 }} className="w-52 glass-card border border-brand-border/60 shadow-elevated py-1 animate-fade-in">
              <div className="px-3 py-1.5 text-[11px] uppercase tracking-wide text-brand-muted">Assign users</div>
              <div className="max-h-60 overflow-y-auto">
                {users.map(u => {
                  const active = assignees.includes(u.id);
                  return (
                    <button
                      key={u.id}
                      onClick={(e)=>{ e.stopPropagation(); onAssign(task.id, u.id); }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-brand-bg/60 ${active ? 'bg-brand-indigo/10 text-brand-indigo font-medium' : 'text-text-primary'}`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="truncate flex-1">{u.name}</span>
                      {active && <span className="text-brand-indigo text-xs">✓</span>}
                    </button>
                  );
                })}
                {!users?.length && <div className="px-3 py-2 text-xs text-brand-muted">No users</div>}
              </div>
            </div>, document.body)
          }
        </div>
      </div>
    </div>
  );
};

const TaskColumn = ({ title, tasks, users, onDropTask, onDragStart, onEdit, onAssign }) => {
    const getColumnColor = (title) => {
        const colors = {
            'New': 'bg-gray-200',
            'In Progress': 'bg-blue-200',
            'Blocked': 'bg-red-200',
            'Done': 'bg-green-200'
        };
        return colors[title] || 'bg-gray-200';
    }

    return (
        <div 
          className="glass-card card-hoverable p-4"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDropTask(e, title)}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-xs font-semibold tracking-wide uppercase text-brand-muted`}>{title}</h3>
                <span className="text-xs font-medium text-text-primary bg-brand-bg rounded-pill px-2 py-0.5">{tasks.length}</span>
            </div>
            <div>
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} users={users} onDragStart={onDragStart} onEdit={onEdit} onAssign={onAssign} />
                ))}
            </div>
        </div>
    );
}

const Tasks = ({ projectId }) => {
  const { tasks, users, projects } = useData();
  const isScoped = !!projectId; // if true, we are inside Project Detail and must hide dropdown
  const [selectedProject, setSelectedProject] = useState(projectId || 'all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // wraps trigger
  const triggerRef = useRef(null); // button itself
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const menuRef = useRef(null); // portal menu container
  const [taskData, setTaskData] = useState(tasks); // local copy to allow drag updates
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const computePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX, width: rect.width });
  };

  useLayoutEffect(() => { if (dropdownOpen) computePosition(); }, [dropdownOpen]);
  useEffect(() => {
    if (!dropdownOpen) return;
    const onResize = () => computePosition();
    window.addEventListener('scroll', onResize, true);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('scroll', onResize, true); window.removeEventListener('resize', onResize); };
  }, [dropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const inTrigger = dropdownRef.current && dropdownRef.current.contains(e.target);
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      if (!inTrigger && !inMenu) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task) => { setEditingTask(task); setModalOpen(true); };

  const relevantTasks = isScoped
    ? taskData.filter(t => t.projectId === projectId)
    : taskData.filter(t => (selectedProject === 'all' ? true : t.projectId === selectedProject));
  const selectedProjectName = selectedProject === 'all' ? 'All Projects' : projects.find(p => p.id === selectedProject)?.name;

  const columns = ['New', 'In Progress', 'Blocked', 'Done'];

  const tasksByStatus = columns.reduce((acc, status) => {
    acc[status] = relevantTasks.filter(task => task.status === status);
    return acc;
  }, {});

  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task.id);
  };

  const handleDropTask = (e, newStatus) => {
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    setTaskData(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
  };

  const saveTask = (task) => {
    setTaskData(prev => {
      const existing = prev.find(t => t.id === task.id);
      if (existing) return prev.map(t => t.id === task.id ? task : t);
      return [...prev, task];
    });
  };

  const deleteTask = (id) => {
    setTaskData(prev => prev.filter(t => t.id !== id));
  };

  // Inline assignee update
  const handleAssign = (taskId, userId) => {
    setTaskData(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const existing = Array.isArray(t.assignees) ? t.assignees : (t.assignee ? [t.assignee] : []);
      const next = existing.includes(userId) ? existing.filter(id => id !== userId) : [...existing, userId];
      return { ...t, assignees: next, assignee: undefined, updatedAt: new Date().toISOString() };
    }));
  };

  return (
    <div className="space-y-6 mount">
      <div className="flex items-center justify-between relative">
        {!isScoped && (
          <div className="relative z-30" ref={dropdownRef}>
            <button
              ref={triggerRef}
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 pl-4 pr-3 py-2.5 rounded-xl bg-white/80 backdrop-blur-xs border border-brand-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-indigo/40 shadow-soft hover:bg-white/90 transition-all"
            >
              <Filter className="w-4 h-4 text-brand-muted" />
              <span className="text-text-primary">{selectedProjectName}</span>
              <ChevronDown className={`w-4 h-4 text-brand-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <button onClick={openCreate} className="btn-pill flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Task
          </button>
          <div className="h-4 w-px bg-brand-border" />
          <div className="text-xs text-brand-muted font-medium">
            {relevantTasks.length} task{relevantTasks.length !== 1 ? 's' : ''}
          </div>
          <div className="h-4 w-px bg-brand-border" />
          <div className="text-xs text-brand-muted">
            {selectedProject !== 'all' && projects.find(p => p.id === selectedProject)?.status}
          </div>
        </div>
      </div>

      {!isScoped && dropdownOpen && createPortal(
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
          className="project-filter-menu glass-card shadow-elevated border border-brand-border/60 py-2 animate-fade-in"
        >
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-muted border-b border-brand-border/60 mb-1">Filter by Project</div>
          <button
            onClick={() => { setSelectedProject('all'); setDropdownOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-bg/60 transition-colors ${selectedProject === 'all' ? 'bg-brand-indigo/10 text-brand-indigo font-medium' : 'text-text-primary'}`}
          >
            All Projects {selectedProject === 'all' && <span className="float-right text-brand-indigo">✓</span>}
          </button>
          <div className="border-t border-brand-border/40 my-1" />
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => { setSelectedProject(project.id); setDropdownOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-bg/60 transition-colors ${selectedProject === project.id ? 'bg-brand-indigo/10 text-brand-indigo font-medium' : 'text-text-primary'}`}
            >
              <div className="flex items-center justify-between">
                <span className="truncate" title={project.name}>{project.name}</span>
                {selectedProject === project.id && <span className="text-brand-indigo flex-shrink-0 ml-2">✓</span>}
              </div>
              <div className="text-xs text-brand-muted mt-0.5 truncate" title={project.customer}>{project.customer}</div>
            </button>
          ))}
        </div>, document.body)
      }

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-4 relative z-10">
        {columns.map(status => (
          <TaskColumn
            key={status}
            title={status}
            tasks={tasksByStatus[status]}
            users={users}
            onDropTask={handleDropTask}
            onDragStart={handleDragStart}
            onEdit={openEdit}
            onAssign={handleAssign}
          />
        ))}
      </div>

      {modalOpen && createPortal(
        <TaskModal
          onClose={() => { setModalOpen(false); setEditingTask(null); }}
          onSave={saveTask}
          onDelete={deleteTask}
          users={users}
          projects={projects}
          scopedProjectId={projectId}
          defaultValue={editingTask}
        />, document.body)
      }
    </div>
  );
};

export default Tasks;

const TaskModal = ({ onClose, onSave, onDelete, users, projects, scopedProjectId, defaultValue }) => {
  const isEditing = !!defaultValue;
  const initial = isEditing
    ? {
        ...defaultValue,
        assignees: Array.isArray(defaultValue.assignees) ? defaultValue.assignees : (defaultValue.assignee ? [defaultValue.assignee] : []),
        assignee: undefined,
        tags: defaultValue.tags || '',
        image: defaultValue.image || null,
        timesheets: Array.isArray(defaultValue.timesheets) ? defaultValue.timesheets : [],
        status: defaultValue.status || 'New',
        priority: defaultValue.priority || 'Medium',
        updatedAt: new Date().toISOString(),
      }
    : {
        id: 'task-' + Math.random().toString(36).slice(2),
        title: '',
        assignees: users[0] ? [users[0].id] : [],
        projectId: scopedProjectId || projects[0]?.id || '',
        tags: '',
        dueDate: new Date().toISOString().slice(0,10),
        status: 'New',
        priority: 'Medium',
        description: '',
        timesheets: [],
        image: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
  const [tab, setTab] = useState('Description');
  const [form, setForm] = useState(initial);

  const setField = (k,v) => setForm(prev => ({ ...prev, [k]: v, updatedAt: new Date().toISOString() }));
  const toggleAssignee = (id) => setField('assignees', form.assignees.includes(id) ? form.assignees.filter(x => x !== id) : [...form.assignees, id]);

  const addTimesheetLine = () => {
    setField('timesheets', [...(form.timesheets || []), { id: 'ts-' + Math.random().toString(36).slice(2), employeeId: users[0]?.id || '', hours: 0 }]);
  };
  const updateTimesheet = (id, patch) => {
    setField('timesheets', (form.timesheets || []).map(t => t.id === id ? { ...t, ...patch } : t));
  };
  const removeTimesheet = (id) => { setField('timesheets', (form.timesheets || []).filter(t => t.id !== id)); };
  const totalHours = (form.timesheets || []).reduce((s,t)=> s + (Number(t.hours)||0), 0);

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...form });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-elevated overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto p-6">
        {/* <button onClick={onClose} className="absolute top-3 right-3 text-brand-muted hover:text-text-primary"><X className="w-5 h-5" /></button> */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{isEditing ? 'Edit Task' : 'Create Task'}</h3>
          <div className="flex gap-2">
            {isEditing && <button type="button" onClick={()=>{ onDelete(defaultValue.id); onClose(); }} className="px-3 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-50">Delete</button>}
            <button onClick={onClose} type="button" className="px-3 py-2 rounded-xl border border-brand-border text-text-primary hover:bg-brand-bg">Discard</button>
            <button onClick={handleSave} type="button" className="btn-pill">Save</button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs text-brand-muted">Title</label>
            <input value={form.title} onChange={e=>setField('title', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" placeholder="Task title" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-1">
              <label className="text-xs text-brand-muted">Assignees</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {users.map(u => {
                  const active = form.assignees.includes(u.id);
                  return (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => toggleAssignee(u.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs transition ${active ? 'bg-brand-indigo text-white border-brand-indigo shadow-sm' : 'bg-white border-brand-border hover:bg-brand-bg'}`}
                    >
                      <img src={u.avatar} alt={u.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="truncate max-w-[90px]">{u.name}</span>
                      {active && <span>✓</span>}
                    </button>
                  );
                })}
                {!users.length && <div className="text-xs text-brand-muted">No users</div>}
              </div>
              <div className="mt-2 text-[11px] text-brand-muted">Selected: {form.assignees.length || 0}</div>
            </div>
            <div>
              <label className="text-xs text-brand-muted">Project</label>
              <div className="relative mt-1">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <select disabled={!!scopedProjectId} value={form.projectId} onChange={e=>setField('projectId', e.target.value)} className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40">
                  {projects.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-brand-muted">Tags (comma separated)</label>
              <input value={form.tags} onChange={e=>setField('tags', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" placeholder="design, backend" />
            </div>
            <div>
              <label className="text-xs text-brand-muted">Deadline</label>
              <div className="relative mt-1">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                <input value={form.dueDate} onChange={e=>setField('dueDate', e.target.value)} type="date" className="pl-9 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" />
              </div>
            </div>
            <div>
              <label className="text-xs text-brand-muted">Image</label>
              <div className="mt-1 flex items-center gap-2">
                <input type="file" accept="image/*" onChange={e=>{ const file=e.target.files?.[0]; if(!file) return; const r=new FileReader(); r.onload=()=> setField('image', r.result); r.readAsDataURL(file); }} className="text-xs" />
                {form.image && <img src={form.image} alt="task" className="h-14 rounded-md border" />}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-2 border-b border-brand-border/70 flex gap-4 text-sm">
            {['Description','Timesheets','Task Info'].map(t => (
              <button type="button" key={t} onClick={()=>setTab(t)} className={`pb-2 px-1 -mb-px border-b-2 ${tab===t? 'border-brand-indigo text-text-primary font-semibold' : 'border-transparent text-brand-muted hover:text-text-primary'}`}>{t}</button>
            ))}
          </div>

          {tab==='Description' && (
            <div>
              <label className="text-xs text-brand-muted">Description</label>
              <textarea value={form.description} onChange={e=>setField('description', e.target.value)} rows={5} className="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-indigo/40" placeholder="Describe the task details" />
            </div>
          )}
          {tab==='Timesheets' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Timesheets</div>
                <button type="button" onClick={addTimesheetLine} className="px-3 py-1.5 rounded-md border border-brand-border text-xs hover:bg-brand-bg flex items-center gap-2"><Plus className="w-4 h-4"/> Add a line</button>
              </div>
              <div className="space-y-2">
                {form.timesheets.map(line => (
                  <div key={line.id} className="grid grid-cols-12 gap-2 items-center">
                    <select value={line.employeeId} onChange={e=>updateTimesheet(line.id,{employeeId:e.target.value})} className="col-span-6 px-3 py-2 rounded-xl border border-brand-border text-sm">{users.map(u=> <option key={u.id} value={u.id}>{u.name}</option>)}</select>
                    <div className="col-span-4 relative">
                      <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                      <input type="number" min={0} value={line.hours} onChange={e=>updateTimesheet(line.id,{hours:Number(e.target.value)})} className="pl-9 w-full px-3 py-2 rounded-xl border border-brand-border text-sm" placeholder="Hours" />
                    </div>
                    <button type="button" onClick={()=>removeTimesheet(line.id)} className="col-span-2 text-red-600 text-xs">Remove</button>
                  </div>
                ))}
                {!form.timesheets.length && <div className="text-xs text-brand-muted">No timesheets yet.</div>}
              </div>
              <div className="mt-2 text-xs text-brand-muted">Total Logged: <span className="font-semibold text-text-primary">{totalHours}h</span></div>
            </div>
          )}
          {tab==='Task Info' && (
            <div className="text-sm space-y-2">
              <div><span className="text-brand-muted">Created:</span> {new Date(form.createdAt).toLocaleString()}</div>
              <div><span className="text-brand-muted">Last Updated:</span> {new Date(form.updatedAt).toLocaleString()}</div>
              <div><span className="text-brand-muted">Total Hours:</span> {totalHours}h</div>
              <div><span className="text-brand-muted">Tags:</span> {form.tags || '—'}</div>
              <div><span className="text-brand-muted">Assignees:</span> {form.assignees.length ? form.assignees.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ') : '—'}</div>
              <div><span className="text-brand-muted">Status:</span> {form.status}</div>
            </div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
};
