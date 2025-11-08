import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ClipboardCheck, BarChart3, Settings, LogOut, Menu, X as Close } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import logoPng from '../assets/logo.png';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = React.useState(false);
  
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

  const NavList = ({ onNavigate }) => (
    <ul className="space-y-1.5">
      {navItems.map((item, index) => (
        <li key={index}>
          <NavLink 
            to={item.path} 
            onClick={() => onNavigate && setOpen(false)}
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
  );

  return (
    <>
      {/* Mobile top bar (fixed, not affecting layout width) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-brand-border/80 px-4 h-14 flex items-center justify-between">
        <button aria-label="Open menu" className="p-2 rounded-lg hover:bg-brand-bg" onClick={() => setOpen(true)}>
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img src={logoPng} alt="OneFlow" className="w-8 h-8 object-contain rounded-md" />
          <span className="font-semibold">OneFlow</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 glass-card bg-white/75 backdrop-blur-md border border-brand-border p-6 shadow-soft">
        <div className="flex items-center mb-7 pl-1">
          <img src={logoPng} alt="OneFlow" className="w-10 h-10 object-contain rounded-md shadow-innerGlow" />
          <h1 className="text-xl font-bold ml-2 tracking-tight text-gradient">OneFlow</h1>
        </div>
        <nav className="flex-1">
          <div className="text-xs uppercase tracking-wide text-brand-muted mb-3 pl-1">Main</div>
          <NavList />
        </nav>
        <div className="mt-auto pt-4 border-t border-brand-border/60">
          <button onClick={logout} className={inactiveLink + ' w-full justify-start'}>
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
            <div className="relative z-50 w-72 max-w-[80%] h-full bg-white shadow-elevated border-r border-brand-border p-5 animate-slide-in-left">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <img src={logoPng} alt="OneFlow" className="w-9 h-9 object-contain rounded-md" />
                  <span className="font-semibold">OneFlow</span>
                </div>
                <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-brand-bg">
                  <Close className="w-5 h-5" />
                </button>
              </div>
              <nav>
                <div className="text-xs uppercase tracking-wide text-brand-muted mb-3 pl-1">Main</div>
                <NavList onNavigate={() => setOpen(false)} />
              </nav>
              <div className="mt-auto pt-4 border-t border-brand-border/60">
                <button onClick={() => { setOpen(false); logout(); }} className={inactiveLink + ' w-full justify-start'}>
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
