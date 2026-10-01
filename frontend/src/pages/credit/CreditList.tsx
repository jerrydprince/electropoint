import React, { useState } from 'react';
import { Search, CreditCard, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function CreditList() {
  const [search, setSearch] = useState('');

  const { data: credits, isLoading } = useQuery({
    queryKey: ['credits', search],
    queryFn: async () => {
      const res = await api.get('/credits', { params: { search } });
      return res.data.data;
    }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customer Credit</h1>
          <p className="text-gray-500 mt-1">Manage post-paid sales, credit limits, and receive payments.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Credit Amount</th>
                <th className="px-6 py-4 text-right">Balance Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading credits...</td></tr>
              ) : credits?.data?.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No credit accounts found.</td></tr>
              ) : (
                credits?.data?.map((credit: any) => (
                  <tr key={credit.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 font-bold text-gray-900">{credit.customer?.first_name} {credit.customer?.last_name}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{credit.sale?.invoice_number}</td>
                    <td className="px-6 py-4 text-gray-600">{new Date(credit.due_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        credit.status === 'paid' ? 'bg-green-100 text-green-700' :
                        credit.status === 'overdue' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {credit.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">₦{parseFloat(credit.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-black text-red-600">₦{parseFloat(credit.balance).toLocaleString()}</td>
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
