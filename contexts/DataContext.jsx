import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useApi } from './ApiContext.jsx';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const api = useApi();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]); // placeholder until users endpoint exists
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Compute progress from tasks (Done/total)
  const computeProgress = useCallback((projectsList, tasksList) => {
    return projectsList.map(p => {
      const pts = tasksList.filter(t => t.projectId === p.id);
      if (!pts.length) return p.status === 'Completed' ? { ...p, progress: 100 } : { ...p, progress: p.progress || 0 };
      const done = pts.filter(t => t.status === 'Done').length;
      const computed = Math.round((done / pts.length) * 100);
      return { ...p, progress: p.status === 'Completed' ? 100 : computed };
    });
  }, []);

  // Initial load: projects + per-project tasks
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true); setError(null);
        const [usersRows, proj] = await Promise.all([
          api.listUsers().catch(()=>[]),
          api.listProjects(),
        ]);
        const taskBatches = [];
        for (const p of proj) {
          try { taskBatches.push(await api.listProjectTasks(p.id)); } catch { taskBatches.push([]); }
        }
        let mergedTasks = taskBatches.flat();
        const hydrated = [];
        for (const t of mergedTasks) {
          try {
            const [assigneesRows, entries] = await Promise.all([
              api.listTaskAssignees(t.id),
              api.listTimeEntries(t.id),
            ]);
            hydrated.push({ ...t, assignees: (assigneesRows || []).map(r => r.user_id), timesheets: entries || [] });
          } catch { hydrated.push(t); }
        }
        if (!mounted) return;
        setUsers(usersRows);
        setTasks(hydrated);
        setProjects(computeProgress(proj, hydrated));
      } catch (e) { if (mounted) setError(e.message); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [api, computeProgress]);

  const getProjectById = (id) => projects.find(p => p.id === id);
  const getTasksByProjectId = (projectId) => tasks.filter(t => t.projectId === projectId);

  const upsertProject = async (project) => {
    // Create or update via API according to presence of numeric id
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
    if (task.id) {
      const updated = await api.updateTask(task.id, task);
      setTasks(prev => {
        const next = prev.map(t => t.id === updated.id ? { ...t, ...updated } : t);
        setProjects(pr => computeProgress(pr, next));
        return next;
      });
    } else {
      const created = await api.createTask(task);
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

  const value = useMemo(() => ({
    projects,
    tasks,
    users,
    loading,
    error,
    getProjectById,
    getTasksByProjectId,
    upsertProject,
    removeProject,
    upsertTask,
    removeTask,
  }), [projects, tasks, users, loading, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
