
import React from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const Analytics = () => {
    const { projects, tasks, users } = useData();

    // Data for Project Progress Chart
    const projectProgressData = projects.map(p => ({
        name: p.name,
        progress: p.progress
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

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-text-primary mb-4">Project Progress (%)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={projectProgressData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={120} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="progress" fill="#714B67" name="Progress" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="font-semibold text-text-primary mb-4">Resource Utilization (Tasks per Member)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                         <RadarChart cx="50%" cy="50%" outerRadius="80%" data={tasksPerUser}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis />
                            <Radar name="Tasks" dataKey="A" stroke="#01A784" fill="#01A784" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
             <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-text-primary mb-4">Project Cost vs Revenue</h3>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={financialsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
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
