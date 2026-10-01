import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

export default function ExpenseCategories() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const res = await api.get('/expense-categories');
      return res.data.data;
    }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/expenses" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-bold mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Expenses
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Expense Categories</h1>
          <p className="text-gray-500 mt-1">Standardized tags for financial tracking.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">Loading categories...</td></tr>
              ) : (
                categories?.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-500">#{c.id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-gray-500">{c.description || '-'}</td>
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
