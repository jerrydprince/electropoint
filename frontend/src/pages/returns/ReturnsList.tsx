import React, { useState } from 'react';
import { Search, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

export default function ReturnsList() {
  const [search, setSearch] = useState('');

  const { data: returns, isLoading } = useQuery({
    queryKey: ['returns', search],
    queryFn: async () => {
      const res = await api.get('/returns', { params: { search } });
      return res.data.data;
    }
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Returns & Refunds</h1>
          <p className="text-gray-500 mt-1">Manage customer returns and process refunds.</p>
        </div>
        <Link to="/returns/create" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center">
          <CheckCircle size={20} className="mr-2" /> Initiate Return
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Return # or Invoice #..."
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
                <th className="px-6 py-4">Return #</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading returns...</td></tr>
              ) : returns?.data?.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No returns found.</td></tr>
              ) : (
                returns?.data?.map((ret: any) => (
                  <tr key={ret.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{ret.return_number}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{ret.sale?.invoice_number}</td>
                    <td className="px-6 py-4">{ret.customer ? `${ret.customer.first_name} ${ret.customer.last_name}` : 'Walk-in'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        ret.status === 'completed' ? 'bg-green-100 text-green-700' :
                        ret.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        ret.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-gray-900">₦{parseFloat(ret.total_amount).toLocaleString()}</td>
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
