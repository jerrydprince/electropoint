import React, { useState } from 'react';
import { Search, ArrowLeft, Wrench } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function CreateClaim() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [warranty, setWarranty] = useState<any>(null);
  const [complaint, setComplaint] = useState('');

  const searchMutation = useMutation({
    mutationFn: async (term: string) => {
      const res = await api.get('/warranties', { params: { search: term } });
      const items = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || [];
      if (items && items.length > 0) {
        return items[0]; // pick first match
      }
      throw new Error('Warranty not found');
    },
    onSuccess: (data) => {
      setWarranty(data);
      toast.success('Warranty loaded');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message);
      setWarranty(null);
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!warranty) throw new Error("No warranty selected");
      const res = await api.post('/warranty-claims', {
        warranty_id: warranty.id,
        complaint
      });
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Claim logged successfully');
      navigate('/warranty-claims');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message);
    }
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link to="/warranty-claims" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-bold mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Claims
      </Link>
      
      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">Log Warranty Claim</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Search Warranty (Serial / Invoice / Phone)</label>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Enter search term..."
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
          />
          <button 
            onClick={() => searchMutation.mutate(searchTerm)}
            disabled={!searchTerm || searchMutation.isPending}
            className="px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition flex items-center disabled:opacity-50"
          >
            <Search size={20} className="mr-2"/> Find
          </button>
        </div>
      </div>

      {warranty && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Warranty: {warranty.warranty_number}</h3>
              <p className="text-gray-500">Status: {warranty.status}</p>
            </div>
            {warranty.status === 'active' ? (
               <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
            ) : (
               <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider">{warranty.status}</span>
            )}
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Product</p>
                <p className="font-bold text-gray-900">{warranty.product?.name}</p>
                <p className="font-mono text-sm text-gray-500">{warranty.serial_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Customer</p>
                <p className="font-bold text-gray-900">{warranty.customer ? `${warranty.customer.first_name} ${warranty.customer.last_name}` : 'Walk-in'}</p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Customer Complaint</label>
              <textarea
                value={complaint}
                onChange={e => setComplaint(e.target.value)}
                rows={4}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition resize-none"
                placeholder="Describe the issue in detail..."
              ></textarea>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => submitMutation.mutate()}
                disabled={!complaint || warranty.status !== 'active' || submitMutation.isPending}
                className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center disabled:opacity-50"
              >
                <Wrench size={20} className="mr-2"/> Submit Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
