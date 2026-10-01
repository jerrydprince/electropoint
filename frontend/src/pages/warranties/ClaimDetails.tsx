import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function ClaimDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    status: '',
    technician_name: '',
    diagnosis: '',
    action_taken: '',
    parts_used: '',
    notes: ''
  });

  const { data: claim, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: async () => {
      const res = await api.get(`/warranty-claims/${id}`);
      return res.data.data;
    }
  });

  useEffect(() => {
    if (claim) {
      setFormData({
        status: claim.status || '',
        technician_name: claim.technician_name || '',
        diagnosis: claim.diagnosis || '',
        action_taken: claim.action_taken || '',
        parts_used: claim.parts_used || '',
        notes: claim.notes || ''
      });
    }
  }, [claim]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.put(`/warranty-claims/${id}`, data);
      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Claim updated successfully');
      queryClient.invalidateQueries({ queryKey: ['claim', id] });
    }
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (!claim) return <div className="p-8">Claim not found</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/warranty-claims" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-bold mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Claims
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Claim {claim.claim_number}</h1>
          <p className="text-gray-500 mt-1">Warranty: {claim.warranty?.warranty_number} | Serial: {claim.warranty?.serial_number}</p>
        </div>
        <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-xl font-bold uppercase tracking-wider text-sm shadow-sm border border-gray-200">
          {claim.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 space-y-6">
          {/* Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Customer Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500 block">Name</span>
                <span className="font-bold text-gray-900">{claim.warranty?.customer ? `${claim.warranty.customer.first_name} ${claim.warranty.customer.last_name}` : 'Walk-in'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Phone</span>
                <span className="font-medium text-gray-900">{claim.warranty?.customer?.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block">Purchase Date</span>
                <span className="font-medium text-gray-900">{new Date(claim.warranty?.purchase_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Original Complaint</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{claim.complaint}</p>
          </div>
        </div>

        <div className="col-span-2">
          {/* Update Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h3 className="font-bold text-xl text-gray-900 mb-6">Workflow Details</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
                  >
                    <option value="received">Received</option>
                    <option value="inspection">Inspection</option>
                    <option value="diagnosis">Diagnosis</option>
                    <option value="repair">Repair</option>
                    <option value="awaiting_parts">Awaiting Parts</option>
                    <option value="replacement_approved">Replacement Approved</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Technician Name</label>
                  <input 
                    type="text"
                    value={formData.technician_name}
                    onChange={e => setFormData({...formData, technician_name: e.target.value})}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Diagnosis</label>
                <textarea 
                  value={formData.diagnosis}
                  onChange={e => setFormData({...formData, diagnosis: e.target.value})}
                  rows={3}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Action Taken</label>
                <input 
                  type="text"
                  value={formData.action_taken}
                  onChange={e => setFormData({...formData, action_taken: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Parts Used</label>
                <textarea 
                  value={formData.parts_used}
                  onChange={e => setFormData({...formData, parts_used: e.target.value})}
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Internal Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  rows={2}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition resize-none"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  onClick={() => updateMutation.mutate(formData)}
                  disabled={updateMutation.isPending}
                  className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg flex items-center disabled:opacity-50"
                >
                  <Save size={20} className="mr-2" /> Save Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
