import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Tag, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

export default function ExpensesList() {
  const [categoryId, setCategoryId] = useState('');
  
  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const res = await api.get('/expense-categories');
      return res.data.data;
    }
  });

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', categoryId],
    queryFn: async () => {
      const res = await api.get('/expenses', { params: { category_id: categoryId } });
      return res.data.data;
    }
  });

  const expenses = Array.isArray(expensesData) ? expensesData : expensesData?.data || [];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expenses</h1>
          <p className="text-gray-500 mt-1">Manage and track company operational expenses.</p>
        </div>
        <div className="flex gap-4">
          <Link to="/finance/expense-categories" className="px-6 py-3 bg-gray-50 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition shadow-sm flex items-center">
            <Tag size={20} className="mr-2" /> Categories
          </Link>
          <Link to="/finance/expenses/create" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center">
            <Plus size={20} className="mr-2" /> Log Expense
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex gap-4">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-64 px-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
          >
            <option value="">All Categories</option>
            {categories?.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Logged By</th>
                <th className="px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading expenses...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No expenses found.</td></tr>
              ) : (
                expenses.map((e: any) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-900">
                        <Calendar size={16} className="text-gray-400 mr-2" />
                        {new Date(e.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold">
                        {e.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₦{parseFloat(e.amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600">
                        <User size={16} className="text-gray-400 mr-2" />
                        {e.user?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 truncate max-w-xs" title={e.notes}>
                      {e.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
