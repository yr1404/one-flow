
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../contexts/DataContext.jsx';
import { DollarSign, FileText, ShoppingCart, Receipt, Building } from 'lucide-react';
import Tasks from './Tasks.jsx';
import NotFound from './NotFound.jsx';

const StatCard = ({ title, value, icon }) => (
    <div className="bg-secondary p-4 rounded-lg flex items-center">
        <div className="p-2 bg-primary text-white rounded-full mr-3">{icon}</div>
        <div>
            <p className="text-sm font-medium text-text-secondary">{title}</p>
            <p className="text-lg font-bold text-text-primary">{value}</p>
        </div>
    </div>
);

const LinkButton = ({ text, icon }) => (
    <button className="flex items-center text-sm font-medium text-text-primary bg-card px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors">
        {icon}
        <span className="ml-2">{text}</span>
    </button>
);


const ProjectDetail = () => {
  const { projectId } = useParams();
  const { getProjectById } = useData();
  const [activeTab, setActiveTab] = useState('Tasks');

  const project = getProjectById(projectId);

  if (!project) {
    return <NotFound />;
  }
  
  const profit = project.revenue - project.cost;

  const tabs = ['Tasks', 'Settings'];

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-text-primary">{project.name}</h2>
            <p className="text-text-secondary mt-1">{project.customer}</p>
          </div>
          <div className="text-right">
             <p className="text-sm text-text-secondary">Deadline</p>
             <p className="font-semibold">{new Date(project.deadline).toLocaleDateString()}</p>
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
      
      <div className="bg-card p-2 rounded-lg shadow-sm flex justify-between items-center">
        <div className="flex space-x-2">
            {tabs.map(tab => (
                 <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-semibold rounded-md ${activeTab === tab ? 'bg-primary text-white' : 'text-text-secondary hover:bg-secondary'}`}>
                    {tab}
                 </button>
            ))}
        </div>
        
        {activeTab === 'Settings' && (
          <div className="flex items-center space-x-2 overflow-x-auto p-2">
            <LinkButton text="Sales Orders" icon={<FileText size={16}/>} />
            <LinkButton text="Purchase Orders" icon={<ShoppingCart size={16}/>} />
            <LinkButton text="Customer Invoices" icon={<Receipt size={16}/>} />
            <LinkButton text="Vendor Bills" icon={<Building size={16}/>} />
          </div>
        )}
      </div>

      <div>
        {activeTab === 'Tasks' && <Tasks projectId={projectId} />}
        {activeTab === 'Settings' && <div className="bg-card p-6 rounded-lg shadow"><p>Financial settings and linked documents for this project would be managed here.</p></div>}
      </div>

    </div>
  );
};

export default ProjectDetail;
