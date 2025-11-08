import React from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell } from 'recharts';

const Analytics = () => {
    const { projects, tasks, users } = useData();

    // Data for Project Progress Chart
    const progressStops = [
      { pct: 0, color: '#EF4444' },   // red - low
      { pct: 50, color: '#F59E0B' },  // amber - medium
      { pct: 75, color: '#4F46E5' },  // brand indigo - good
      { pct: 100, color: '#10B981' }  // green - excellent
    ];
    const hexToRgb = (hex) => {
      const v = hex.replace('#','');
      const n = parseInt(v, 16);
      return [ (n >> 16) & 255, (n >> 8) & 255, n & 255 ];
    };
    const rgbToHex = (r,g,b) => '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
    const lerp = (a,b,t) => Math.round(a + (b-a)*t);
    const interpolateColor = (c1, c2, t) => {
      const [r1,g1,b1] = hexToRgb(c1); const [r2,g2,b2] = hexToRgb(c2);
      return rgbToHex(lerp(r1,r2,t), lerp(g1,g2,t), lerp(b1,b2,t));
    };
    const progressToColor = (v) => {
      const x = Math.max(0, Math.min(100, v));
      for (let i=0;i<progressStops.length-1;i++) {
        const a = progressStops[i], b = progressStops[i+1];
        if (x >= a.pct && x <= b.pct) {
          const t = (x - a.pct) / (b.pct - a.pct || 1);
          return interpolateColor(a.color, b.color, t);
        }
      }
      return progressStops[progressStops.length-1].color;
    };

    const projectProgressData = projects.map((p) => ({
        name: p.name,
        progress: p.progress,
        color: progressToColor(p.progress)
    }));

    // Data for Resource Utilization Chart
    const tasksPerUser = users.map(user => ({
        subject: user.name,
        A: tasks.filter(t => t.assignee === user.id).length,
        fullMark: tasks.length
    }));
    
    // Data for Cost vs Revenue Chart
    const financialsData = projects.map(p => ({
        name: p.name,
        Revenue: p.revenue,
        Cost: p.cost,
    }));

    // KPI metrics
    const totalProjects = projects.length;
    const tasksCompleted = tasks.filter(t => t.status === 'Done').length;
    const hoursLogged = 2456; // mock aggregate hours
    const billableHours = Math.round(hoursLogged * 0.72); // mock split
    const nonBillableHours = hoursLogged - billableHours;

    const kpis = [
      { label: 'Total Projects', value: totalProjects },
      { label: 'Tasks Completed', value: tasksCompleted },
      { label: 'Hours Logged', value: hoursLogged.toLocaleString() },
      { label: 'Billable vs Non‑Billable', value: `${billableHours.toLocaleString()} / ${nonBillableHours.toLocaleString()}` },
    ];

    return (
        <div className="space-y-8 mount">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map(k => (
              <div key={k.label} className="stat-card card-hoverable">
                <div>
                  <p className="stat-label">{k.label}</p>
                  <p className="stat-value text-base lg:text-2xl">{k.value}</p>
                </div>
              </div>
            ))}
          </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 card-hoverable">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Project Progress (%)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projectProgressData} layout="vertical" margin={{ left: 8, right: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              width={150}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }}
                              tickFormatter={(v) => (v && v.length > 18 ? v.slice(0, 18) + '…' : v)}
                            />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="progress" name="Progress">
                              {projectProgressData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} />
                              ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="glass-card p-6 card-hoverable">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Resource Utilization (Tasks per Member)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={tasksPerUser}>
                            <PolarGrid />
                            {/* Draw radar first so axis labels render above the colored area */}
                            <Radar name="Tasks" dataKey="A" stroke="#01A784" fill="#01A784" fillOpacity={0.35} />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 15, fontWeight: 600 }} />
                            <PolarRadiusAxis tick={{ fill: '#475569', fontSize: 12 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="glass-card p-6 card-hoverable">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Project Cost vs Revenue</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={financialsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 13, fontWeight: 500 }} tickFormatter={(v) => (v && v.length > 14 ? v.slice(0, 14) + '…' : v)} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="Cost" stroke="#EF4444" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export default Analytics;
