
import React from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { DollarSign, FolderKanban, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const KpiCard = ({ title, value, icon, color }) => (
  <div className="bg-card p-6 rounded-lg shadow flex items-center">
    <div className={`p-3 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-text-secondary">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { projects, tasks } = useData();

  const activeProjects = projects.filter(p => p.status === 'In Progress').length;
  const totalRevenue = projects.reduce((acc, p) => acc + p.revenue, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
  const totalHoursLogged = 1345; // Mock data
  const delayedTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'Done').length;

  const projectStatusData = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  
  const pieData = Object.keys(projectStatusData).map(key => ({ name: key, value: projectStatusData[key] }));
  const COLORS = { 'In Progress': '#3B82F6', 'Planned': '#F97316', 'Completed': '#10B981', 'On Hold': '#6B7280'};

  const projectFinancials = projects.map(p => ({
    name: p.name.split(' ')[0],
    Revenue: p.revenue,
    Cost: p.cost,
    Profit: p.revenue - p.cost
  }));


  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard title="Active Projects" value={activeProjects} icon={<FolderKanban className="text-white"/>} color="bg-blue-500" />
        <KpiCard title="Revenue Earned" value={totalRevenue} icon={<DollarSign className="text-white"/>} color="bg-green-500" />
        <KpiCard title="Hours Logged" value={totalHoursLogged.toLocaleString()} icon={<Clock className="text-white"/>} color="bg-orange-500" />
        <KpiCard title="Delayed Tasks" value={delayedTasks} icon={<AlertTriangle className="text-white"/>} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
          <h3 className="font-semibold text-text-primary mb-4">Project Financials</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectFinancials}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Revenue" fill="#10B981" />
              <Bar dataKey="Cost" fill="#EF4444" />
              <Bar dataKey="Profit" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card p-6 rounded-lg shadow">
          <h3 className="font-semibold text-text-primary mb-4">Project Status Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
             <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
