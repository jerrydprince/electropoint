import React, { useState, useEffect } from 'react';
import { useCreateCorporatePlan, useUpdateCorporatePlan, useCorporatePlan } from '../../hooks/useCorporatePlans';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  planId?: number | null;
}

export default function CorporatePlanForm({ isOpen, onClose, planId }: Props) {
  const isEdit = !!planId;

  const { data: plan, isLoading } = useCorporatePlan(planId ? String(planId) : undefined);
  const createPlan = useCreateCorporatePlan();
  const updatePlan = useUpdateCorporatePlan();

  const [formData, setFormData] = useState({
    name: '',
    discount_type: 'percentage',
    discount_percentage: 0,
    fixed_discount: 0,
    description: '',
    is_active: true,
    company_id: 1 // Default to main company
  });

  useEffect(() => {
    if (isOpen) {
      if (isEdit && plan) {
        setFormData({
          name: plan.name || '',
          discount_type: plan.discount_type || 'percentage',
          discount_percentage: plan.discount_percentage || 0,
          fixed_discount: plan.fixed_discount || 0,
          description: plan.description || '',
          is_active: plan.is_active ?? true,
          company_id: plan.company_id || 1
        });
      } else if (!isEdit) {
        setFormData({
          name: '',
          discount_type: 'percentage',
          discount_percentage: 0,
          fixed_discount: 0,
          description: '',
          is_active: true,
          company_id: 1
        });
      }
    }
  }, [isOpen, isEdit, plan]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updatePlan.mutate({ id: String(planId), data: formData }, {
        onSuccess: () => {
          toast.success("Corporate Plan updated successfully");
          onClose();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed')
      });
    } else {
      createPlan.mutate(formData, {
        onSuccess: () => {
          toast.success("Corporate Plan created successfully");
          onClose();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Creation failed')
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Corporate Plan' : 'Create Corporate Plan'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isEdit && isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <form id="plan-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" placeholder="e.g. Gold Tier" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type *</label>
                <select value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₦)</option>
                </select>
              </div>

              {formData.discount_type === 'percentage' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Percentage (%) *</label>
                  <input required type="number" min="0" max="100" step="0.01" value={formData.discount_percentage} onChange={e => setFormData({...formData, discount_percentage: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition font-bold text-primary" />
                  <p className="text-xs text-gray-500 mt-1">Percentage applied automatically to all purchases made by linked corporate accounts.</p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fixed Discount Amount (₦) *</label>
                  <input required type="number" min="0" step="0.01" value={formData.fixed_discount} onChange={e => setFormData({...formData, fixed_discount: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition font-bold text-primary" />
                  <p className="text-xs text-gray-500 mt-1">Fixed amount subtracted from the total.</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" rows={3}></textarea>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={formData.is_active} 
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  className="w-4 h-4 text-primary bg-white border-gray-300 rounded focus:ring-primary/50"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-700 cursor-pointer">Plan is Active</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" form="plan-form" className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm">
                  {isEdit ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
