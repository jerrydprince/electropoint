import React, { useState } from 'react';
import { Search, Wrench, FileText, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

export default function ClaimsList() {
  const [status, setStatus] = useState('');

  const { data: claimsData, isLoading } = useQuery({
    queryKey: ['warranty-claims', status],
    queryFn: async () => {
      const res = await api.get('/warranty-claims', { params: { status } });
      return res.data.data;
    }
  });

  const claims = Array.isArray(claimsData) ? claimsData : claimsData?.data || [];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Warranty Claims</h1>
          <p className="text-gray-500 mt-1">Manage repair and replacement workflows.</p>
        </div>
        <Link to="/warranty-claims/create" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center">
          <Wrench size={20} className="mr-2" /> Log New Claim
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-64 px-4 py-2 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
          >
            <option value="">All Statuses</option>
            <option value="received">Received</option>
            <option value="inspection">Inspection</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="repair">Repair</option>
            <option value="awaiting_parts">Awaiting Parts</option>
            <option value="replacement_approved">Replacement Approved</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Claim #</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading claims...</td></tr>
              ) : claims.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No claims found.</td></tr>
              ) : (
                claims.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition group">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{c.claim_number}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{c.warranty?.product?.name}</td>
                    <td className="px-6 py-4">{c.warranty?.customer ? `${c.warranty.customer.first_name} ${c.warranty.customer.last_name}` : 'Walk-in'}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider">
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/warranty-claims/${c.id}`} className="inline-flex items-center text-primary hover:text-red-700 font-bold transition">
                        Manage <Activity size={16} className="ml-1" />
                      </Link>
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
