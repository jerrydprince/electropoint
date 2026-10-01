import React, { useState } from 'react';
import { useCustomers, useDeleteCustomer } from '../../hooks/useCustomers';
import { Users, Plus, Search, Edit2, Trash2, Eye, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import CreditList from '../credit/CreditList';
import CustomerForm from './CustomerForm';

export default function CustomerManager() {
  const [activeTab, setActiveTab] = useState<'directory' | 'credit'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);

  const { data: customersData, isLoading } = useCustomers({ search: searchTerm });
  const deleteCustomer = useDeleteCustomer();

  const customers = Array.isArray(customersData) ? customersData : customersData?.data || [];

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      deleteCustomer.mutate(id, {
        onSuccess: () => toast.success("Customer deleted"),
        onError: (err: any) => toast.error(err.response?.data?.message || 'Error deleting customer')
      });
    }
  };

  if (isLoading && !customers.length) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="p-8 animate-fade-in w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="mr-3 text-primary" size={32} />
            Customer Management
          </h1>
          <p className="text-gray-500 mt-2">Manage customer profiles and CRM data.</p>
        </div>
        {activeTab === 'directory' && (
          <button type="button" 
            onClick={() => { setEditId(null); setIsModalOpen(true); }}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 flex items-center shadow-sm"
          >
            <Plus size={20} className="mr-2" /> Add Customer
          </button>
        )}
      </div>

      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-6 py-3 font-bold flex items-center transition-colors border-b-2 ${
            activeTab === 'directory'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users size={18} className="mr-2" /> Directory
        </button>
        <button
          onClick={() => setActiveTab('credit')}
          className={`px-6 py-3 font-bold flex items-center transition-colors border-b-2 ${
            activeTab === 'credit'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <CreditCard size={18} className="mr-2" /> Credit Management
        </button>
      </div>

      {activeTab === 'directory' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div className="relative w-96">
            <input 
              type="text" 
              placeholder="Search by name, code, phone or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Code</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Name</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Contact</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No customers found.</td></tr>
            ) : (
              customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-primary">{c.customer_code}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{c.title ? `${c.title} ` : ''}{c.first_name} {c.last_name}</div>
                    {c.company_name && <div className="text-xs text-gray-500">{c.company_name}</div>}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900">{c.phone || '-'}</div>
                    <div className="text-xs text-gray-500">{c.email || '-'}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold uppercase">{c.customer_type}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link to={`/customers/${c.id}`} className="p-2 text-gray-500 hover:text-primary bg-gray-50 rounded-lg transition" title="View Profile">
                        <Eye size={18} />
                      </Link>
                      <button onClick={() => { setEditId(c.id); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-primary bg-gray-50 rounded-lg transition" title="Edit">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 rounded-lg transition" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden -m-8 p-0">
          <CreditList />
        </div>
      )}
      <CustomerForm 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditId(null); }} 
        customerId={editId} 
      />
    </div>
  );
}
