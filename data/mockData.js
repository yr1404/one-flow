
export const initialData = {
  projects: [
    { id: 'proj-001', name: 'Brand Website Redesign', customer: 'Innovate Inc.', status: 'In Progress', budget: 100000, revenue: 50000, cost: 25000, progress: 60, manager: 'Alex Hartman', team: ['user-002', 'user-003'], deadline: '2024-12-15' },
    { id: 'proj-002', name: 'Mobile App Development', customer: 'Tech Solutions LLC', status: 'Planned', budget: 150000, revenue: 0, cost: 0, progress: 10, manager: 'Alex Hartman', team: ['user-003', 'user-004'], deadline: '2025-03-31' },
    { id: 'proj-003', name: 'E-commerce Platform', customer: 'Global Retail', status: 'Completed', budget: 200000, revenue: 200000, cost: 120000, progress: 100, manager: 'Jane Doe', team: ['user-002', 'user-004'], deadline: '2024-06-30' },
    { id: 'proj-004', name: 'Cloud Migration', customer: 'Data Corp', status: 'On Hold', budget: 80000, revenue: 10000, cost: 5000, progress: 25, manager: 'Jane Doe', team: ['user-003'], deadline: '2024-11-01' },
  ],
  tasks: [
    { id: 'task-001', projectId: 'proj-001', title: 'UI/UX Wireframing', status: 'Done', assignee: 'user-002', priority: 'High', dueDate: '2024-08-15' },
    { id: 'task-002', projectId: 'proj-001', title: 'Frontend Development', status: 'In Progress', assignee: 'user-003', priority: 'High', dueDate: '2024-09-30' },
    { id: 'task-003', projectId: 'proj-001', title: 'Backend API Integration', status: 'New', assignee: 'user-003', priority: 'Medium', dueDate: '2024-10-15' },
    { id: 'task-004', projectId: 'proj-001', title: 'User Testing', status: 'Blocked', assignee: 'user-002', priority: 'Low', dueDate: '2024-11-01' },
    { id: 'task-005', projectId: 'proj-002', title: 'Requirement Gathering', status: 'Done', assignee: 'user-004', priority: 'High', dueDate: '2024-08-20' },
    { id: 'task-006', projectId: 'proj-002', title: 'Initial Prototyping', status: 'In Progress', assignee: 'user-003', priority: 'Medium', dueDate: '2024-09-10' },
    { id: 'task-007', projectId: 'proj-003', title: 'Final Deployment', status: 'Done', assignee: 'user-002', priority: 'High', dueDate: '2024-06-25' },
  ],
  users: [
    { id: 'user-001', name: 'Alex Hartman', role: 'Project Manager', avatar: 'https://picsum.photos/seed/alex/100/100' },
    { id: 'user-002', name: 'Brenda Smith', role: 'Team Member', avatar: 'https://picsum.photos/seed/brenda/100/100' },
    { id: 'user-003', name: 'Charles Brown', role: 'Team Member', avatar: 'https://picsum.photos/seed/charles/100/100' },
    { id: 'user-004', name: 'Diana Prince', role: 'Team Member', avatar: 'https://picsum.photos/seed/diana/100/100' },
    { id: 'user-005', name: 'Jane Doe', role: 'Project Manager', avatar: 'https://picsum.photos/seed/jane/100/100' },
  ],
  salesOrders: [
    { id: 'SO-001', number: 'SO2024-001', projectId: 'proj-001', customer: 'Innovate Inc.', amount: 100000, date: '2024-07-01', state: 'Confirmed' },
    { id: 'SO-002', number: 'SO2024-002', projectId: 'proj-002', customer: 'Tech Solutions LLC', amount: 150000, date: '2024-07-15', state: 'Draft' },
    { id: 'SO-003', number: 'SO2024-003', projectId: 'proj-003', customer: 'Global Retail', amount: 200000, date: '2024-01-10', state: 'Confirmed' },
  ],
  purchaseOrders: [
    { id: 'PO-001', number: 'PO2024-001', projectId: 'proj-001', vendor: 'Creative Agency', amount: 15000, date: '2024-07-05', state: 'Confirmed' },
    { id: 'PO-002', number: 'PO2024-002', projectId: 'proj-003', vendor: 'Cloud Services Inc.', amount: 50000, date: '2024-02-01', state: 'Confirmed' },
  ],
  customerInvoices: [
    { id: 'INV-001', number: 'INV2024-001', projectId: 'proj-001', customer: 'Innovate Inc.', amount: 50000, date: '2024-08-01', state: 'Paid' },
    { id: 'INV-002', number: 'INV2024-002', projectId: 'proj-003', customer: 'Global Retail', amount: 100000, date: '2024-03-15', state: 'Paid' },
    { id: 'INV-003', number: 'INV2024-003', projectId: 'proj-003', customer: 'Global Retail', amount: 100000, date: '2024-06-20', state: 'Paid' },
  ],
  vendorBills: [
    { id: 'BILL-001', number: 'BILL2024-001', projectId: 'proj-001', vendor: 'Creative Agency', amount: 15000, date: '2024-07-20', state: 'Paid' },
    { id: 'BILL-002', number: 'BILL2024-002', projectId: 'proj-003', vendor: 'Cloud Services Inc.', amount: 50000, date: '2024-02-28', state: 'Paid' },
  ],
  expenses: [
    { id: 'EXP-001', number: 'EXP2024-001', projectId: 'proj-001', employee: 'Charles Brown', amount: 500, date: '2024-08-10', state: 'Approved', description: 'Client meeting travel' },
    { id: 'EXP-002', number: 'EXP2024-002', projectId: 'proj-003', employee: 'Brenda Smith', amount: 1200, date: '2024-04-05', state: 'Paid', description: 'Software license' },
  ]
};
