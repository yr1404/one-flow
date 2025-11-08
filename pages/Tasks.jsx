
import React from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { MoreHorizontal } from 'lucide-react';

const TaskCard = ({ task, users }) => {
  const assignee = users.find(u => u.id === task.assignee);
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'border-l-red-500';
      case 'Medium': return 'border-l-orange-500';
      case 'Low': return 'border-l-blue-500';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <div className={`bg-card rounded-lg shadow p-4 mb-4 border-l-4 ${getPriorityColor(task.priority)}`}>
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-text-primary">{task.title}</h4>
        <button className="text-text-secondary hover:text-text-primary">
            <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="flex justify-between items-end mt-4">
        <div className="text-xs text-text-secondary">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </div>
        {assignee && (
          <img 
            src={assignee.avatar} 
            alt={assignee.name} 
            title={assignee.name}
            className="w-8 h-8 rounded-full"
          />
        )}
      </div>
    </div>
  );
};


const TaskColumn = ({ title, tasks, users }) => {
    const getColumnColor = (title) => {
        const colors = {
            'New': 'bg-gray-200',
            'In Progress': 'bg-blue-200',
            'Blocked': 'bg-red-200',
            'Done': 'bg-green-200'
        };
        return colors[title] || 'bg-gray-200';
    }

    return (
        <div className="bg-secondary rounded-lg p-4 w-full md:w-1/4 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
                <h3 className={`text-sm font-bold px-2 py-1 rounded-md ${getColumnColor(title)}`}>{title}</h3>
                <span className="text-sm font-semibold text-text-secondary bg-gray-200 rounded-full px-2 py-0.5">{tasks.length}</span>
            </div>
            <div>
                {tasks.map(task => (
                    <TaskCard key={task.id} task={task} users={users} />
                ))}
            </div>
        </div>
    );
}

const Tasks = ({ projectId }) => {
  const { tasks, users } = useData();

  const relevantTasks = projectId ? tasks.filter(t => t.projectId === projectId) : tasks;

  const columns = ['New', 'In Progress', 'Blocked', 'Done'];

  const tasksByStatus = columns.reduce((acc, status) => {
    acc[status] = relevantTasks.filter(task => task.status === status);
    return acc;
  }, {});

  return (
    <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
      {columns.map(status => (
        <TaskColumn
          key={status}
          title={status}
          tasks={tasksByStatus[status]}
          users={users}
        />
      ))}
    </div>
  );
};

export default Tasks;
