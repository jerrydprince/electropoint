import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

export default function RegisterMovements() {
  const { data: register, isLoading } = useQuery({
    queryKey: ['cash-register-current'],
    queryFn: async () => {
      const res = await api.get('/cash-register/current');
      return res.data.data;
    }
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!register) return <div className="p-8">No open register.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/cash-register" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-bold mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Register
      </Link>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Register Movements</h1>
          <p className="text-gray-500 mt-1">All cash flow for the current open session.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Reference</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {register.movements?.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No movements yet.</td></tr>
              ) : (
                register.movements?.map((m: any) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(m.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      {parseFloat(m.amount) > 0 ? (
                        <span className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center w-fit">
                          <ArrowUpRight size={14} className="mr-1" /> {m.type.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center w-fit">
                          <ArrowDownRight size={14} className="mr-1" /> {m.type.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{m.reference || '-'}</div>
                      <div className="text-xs text-gray-500">{m.notes}</div>
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${parseFloat(m.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {parseFloat(m.amount) > 0 ? '+' : ''}₦{parseFloat(m.amount).toLocaleString()}
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
