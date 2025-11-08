import React from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { DollarSign, FolderKanban, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const KpiCard = ({ title, value, icon, color }) => (
  <div className="stat-card card-hoverable">
    <div className={`icon-ring ${color}`}>{icon}</div>
    <div>
      <p className="stat-label">{title}</p>
      <p className="stat-value">{value}</p>
    </div>
  </div>
);

const RADIAN = Math.PI / 180;
const renderPercentLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#0f172a" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

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
    name: p.name.length > 12 ? p.name.substring(0, 12) + '...' : p.name, // truncate long names
    fullName: p.name, // keep full name for tooltip
    Revenue: p.revenue,
    Cost: p.cost,
    Profit: p.revenue - p.cost
  }));

  const formatCurrency = (value) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 shadow-elevated border border-brand-border/60">
          <p className="font-medium text-text-primary mb-2">{data.fullName}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mount space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Active Projects" value={activeProjects} icon={<FolderKanban className="text-white"/>} color="bg-blue-500" />
        <KpiCard title="Revenue Earned" value={totalRevenue} icon={<DollarSign className="text-white"/>} color="bg-green-500" />
        <KpiCard title="Hours Logged" value={totalHoursLogged.toLocaleString()} icon={<Clock className="text-white"/>} color="bg-orange-500" />
        <KpiCard title="Delayed Tasks" value={delayedTasks} icon={<AlertTriangle className="text-white"/>} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6 card-hoverable">
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2"><span className="text-gradient">Project Financials</span></h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={projectFinancials} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                interval={0} 
                angle={0} 
                textAnchor="middle"
                tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
                tickLine={{ stroke: '#E2E8F0' }}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis 
                tick={{ fill: '#64748B', fontSize: 12 }}
                tickLine={{ stroke: '#E2E8F0' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px', fontSize: '13px', fontWeight: 500 }}
                iconType="rect"
              />
              <Bar dataKey="Revenue" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Cost" fill="#EF4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Profit" fill="#4F46E5" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-6 card-hoverable overflow-hidden">
          <h3 className="font-semibold text-text-primary mb-4"><span className="text-gradient">Project Status Overview</span></h3>
          <ResponsiveContainer width="100%" height={300}>
             <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius="75%"
                paddingAngle={2}
                dataKey="value"
                label={renderPercentLabel}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
