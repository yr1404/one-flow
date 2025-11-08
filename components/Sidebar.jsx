import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ClipboardCheck, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  
  const navItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, text: 'Projects', path: '/projects' },
    { icon: ClipboardCheck, text: 'Tasks', path: '/tasks' },
    { icon: BarChart3, text: 'Analytics', path: '/analytics' },
    { icon: Settings, text: 'Settings', path: '/sales-orders' },
  ];

  const settingsRoutes = ['/sales-orders','/purchase-orders','/customer-invoices','/vendor-bills','/expenses'];

  const activeLink = 'flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl bg-brand-indigo text-white shadow-soft ring-1 ring-brand-indigo/40';
  const inactiveLink = 'flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl text-text-primary/80 hover:text-text-primary transition-all border border-transparent hover:border-brand-border hover:bg-white/70 hover:shadow-soft';

  return (
    <aside className="hidden md:flex flex-col w-64 glass-card bg-white/75 backdrop-blur-md border border-brand-border p-6 shadow-soft">
      <div className="flex items-center mb-7 pl-1">
        <svg className="w-9 h-9" viewBox="0 0 102 68" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M43.69 0L21.845 27.2727L0 0H28.2571L43.69 19.3182L59.1229 0H87.38L43.69 68L0 0H43.69Z" fill="#714B67"/><path d="M58.31 0L79.9325 27.2727L101.555 0H73.52L58.31 19.3182L43.0975 0H14.84L58.31 68L101.555 0H58.31Z" fill="#01A784"/></svg>
        <h1 className="text-xl font-bold ml-2 tracking-tight text-gradient">OneFlow</h1>
      </div>
      <nav className="flex-1">
        <div className="text-xs uppercase tracking-wide text-brand-muted mb-3 pl-1">Main</div>
        <ul className="space-y-1.5">
          {navItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path} 
                className={({ isActive }) => {
                  const isSettingsItem = item.text === 'Settings';
                  const isSettingsActive = isSettingsItem && settingsRoutes.some(r => location.pathname.startsWith(r));
                  const active = isSettingsItem ? (isActive || isSettingsActive) : isActive;
                  return active ? activeLink : inactiveLink;
                }}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto pt-4 border-t border-brand-border/60">
         <button onClick={logout} className={inactiveLink + ' w-full justify-start'}>
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
         </button>
      </div>
    </aside>
  );
};

export default Sidebar;
