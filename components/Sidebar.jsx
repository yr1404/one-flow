
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, ClipboardCheck, BarChart3, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Sidebar = () => {
  const { logout } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, text: 'Projects', path: '/projects' },
    { icon: ClipboardCheck, text: 'Tasks', path: '/tasks' },
    { icon: BarChart3, text: 'Analytics', path: '/analytics' },
    { icon: Settings, text: 'Settings', path: '/sales-orders' }, // Default settings to SO
  ];

  const activeLink = "flex items-center px-4 py-2 text-white bg-primary rounded-lg";
  const inactiveLink = "flex items-center px-4 py-2 text-text-primary hover:bg-secondary rounded-lg transition-colors duration-200";

  return (
    <div className="flex flex-col w-64 bg-card p-4 border-r border-gray-200">
      <div className="flex items-center mb-10">
        <svg className="w-10 h-10 text-primary" viewBox="0 0 102 68" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M43.69 0L21.845 27.2727L0 0H28.2571L43.69 19.3182L59.1229 0H87.38L43.69 68L0 0H43.69Z" fill="#714B67"/><path d="M58.31 0L79.9325 27.2727L101.555 0H73.52L58.31 19.3182L43.0975 0H14.84L58.31 68L101.555 0H58.31Z" fill="#01A784"/></svg>
        <h1 className="text-2xl font-bold ml-2 text-primary">OneFlow</h1>
      </div>
      <nav className="flex-1">
        <ul>
          {navItems.map((item, index) => (
            <li key={index} className="mb-2">
              <NavLink 
                to={item.path} 
                className={({ isActive }) => isActive ? activeLink : inactiveLink}
              >
                <item.icon className="w-5 h-5" />
                <span className="ml-3">{item.text}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div>
         <button onClick={logout} className={inactiveLink + " w-full"}>
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Logout</span>
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
