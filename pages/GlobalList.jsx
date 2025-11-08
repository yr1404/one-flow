
import React from 'react';
import { useData } from '../contexts/DataContext.jsx';
import { Plus, Search } from 'lucide-react';

const GlobalList = ({ type }) => {
  const data = useData();

  const listDataMap = {
    'Sales Order': data.salesOrders,
    'Purchase Order': data.purchaseOrders,
    'Customer Invoice': data.customerInvoices,
    'Vendor Bill': data.vendorBills,
    'Expense': data.expenses,
  };
  
  const headersMap = {
    'Sales Order': ['Number', 'Project', 'Customer', 'Date', 'Amount', 'State'],
    'Purchase Order': ['Number', 'Project', 'Vendor', 'Date', 'Amount', 'State'],
    'Customer Invoice': ['Number', 'Project', 'Customer', 'Date', 'Amount', 'State'],
    'Vendor Bill': ['Number', 'Project', 'Vendor', 'Date', 'Amount', 'State'],
    'Expense': ['Number', 'Project', 'Employee', 'Date', 'Amount', 'Description', 'State'],
  };

  const listData = listDataMap[type] || [];
  const headers = headersMap[type] || [];

  const renderRow = (item) => {
    switch (type) {
      case 'Sales Order': return [item.number, data.getProjectById(item.projectId)?.name, item.customer, item.date, item.amount, item.state];
      case 'Purchase Order': return [item.number, data.getProjectById(item.projectId)?.name, item.vendor, item.date, item.amount, item.state];
      case 'Customer Invoice': return [item.number, data.getProjectById(item.projectId)?.name, item.customer, item.date, item.amount, item.state];
      case 'Vendor Bill': return [item.number, data.getProjectById(item.projectId)?.name, item.vendor, item.date, item.amount, item.state];
      case 'Expense': return [item.number, data.getProjectById(item.projectId)?.name, item.employee, item.date, item.amount, item.description, item.state];
      default: return [];
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder={`Search ${type}s...`}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button className="flex items-center bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Create {type}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              {headers.map(header => (
                <th key={header} scope="col" className="px-6 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listData.map((item) => (
              <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                {renderRow(item).map((cell, index) => (
                  <td key={index} className="px-6 py-4 whitespace-nowrap">
                    {typeof cell === 'number' ? cell.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GlobalList;
