
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

const ProjectCard = ({ project }) => {
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
  
  return (
    <div 
      className="bg-card rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-bold text-text-primary">{project.name}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>
      <p className="text-sm text-text-secondary mt-1">{project.customer}</p>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-text-secondary mb-1">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
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
  const { projects } = useData();
  const [filter, setFilter] = useState('All');

  const filteredProjects = projects.filter(p => filter === 'All' || p.status === filter);

  const filters = ['All', 'Planned', 'In Progress', 'Completed', 'On Hold'];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-1 bg-secondary p-1 rounded-lg">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === f ? 'bg-card shadow text-primary' : 'text-text-secondary hover:text-primary'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <button className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Create Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

export default Projects;
