import React, { useState } from 'react';
import { Search, Shield, ShieldAlert, CheckCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function WarrantiesList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const { data: warrantiesData, isLoading } = useQuery({
    queryKey: ['warranties', search, status],
    queryFn: async () => {
      const res = await api.get('/warranties', { params: { search, status } });
      return res.data.data;
    }
  });

  const warranties = Array.isArray(warrantiesData) ? warrantiesData : warrantiesData?.data || [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Warranty Directory</h1>
          <p className="text-gray-500 mt-1">Track active and expiring product warranties.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Serial Number, Invoice, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-48 px-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="voided">Voided</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Warranty #</th>
                <th className="px-6 py-4">Product & Serial</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading warranties...</td></tr>
              ) : warranties.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No warranties found.</td></tr>
              ) : (
                warranties.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{w.warranty_number}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{w.product?.name}</div>
                      <div className="font-mono text-xs text-gray-500">{w.serial_number}</div>
                    </td>
                    <td className="px-6 py-4">
                      {w.customer ? (
                        <>
                          <div className="font-medium text-gray-900">{w.customer.first_name} {w.customer.last_name}</div>
                          <div className="text-xs text-gray-500">{w.customer.phone}</div>
                        </>
                      ) : (
                        <span className="text-gray-400 italic">Walk-in Customer</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-2 text-gray-400" />
                        {new Date(w.expiry_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {w.status === 'active' && <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-fit"><Shield size={14} className="mr-1"/> Active</span>}
                      {w.status === 'expired' && <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center w-fit"><ShieldAlert size={14} className="mr-1"/> Expired</span>}
                      {w.status === 'voided' && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">Voided</span>}
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
