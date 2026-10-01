import React, { useState, useEffect } from 'react';
import { useCreateCustomer, useUpdateCustomer, useCustomer } from '../../hooks/useCustomers';
import { useCorporatePlans } from '../../hooks/useCorporatePlans';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string | number | null;
}

export default function CorporateAccountForm({ isOpen, onClose, customerId }: Props) {
  const isEdit = !!customerId;

  const { data: customer, isLoading } = useCustomer(customerId ? String(customerId) : undefined);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  
  const { data: plansData } = useCorporatePlans();
  const allPlans = Array.isArray(plansData) ? plansData : plansData?.data || [];

  const [formData, setFormData] = useState<any>({
    company_name: '', phone: '', email: '', address: '',
    customer_type: 'corporate', credit_limit: 0, notes: '', status: 'active',
    first_name: 'Corporate', last_name: 'Account', corporate_plan_id: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (isEdit && customer) {
        setFormData({
          company_name: customer.company_name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          address: customer.address || '',
          customer_type: 'corporate',
          credit_limit: customer.credit_limit || 0,
          notes: customer.notes || '',
          status: customer.status || 'active',
          first_name: customer.first_name || 'Corporate',
          last_name: customer.last_name || 'Account',
          corporate_plan_id: customer.corporate_plan_id || ''
        });
      } else if (!isEdit) {
        setFormData({
          company_name: '', phone: '', email: '', address: '',
          customer_type: 'corporate', credit_limit: 0, notes: '', status: 'active',
          first_name: 'Corporate', last_name: 'Account', corporate_plan_id: ''
        });
      }
    }
  }, [isOpen, isEdit, customer]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateCustomer.mutate({ id: String(customerId), data: formData }, {
        onSuccess: () => {
          toast.success("Corporate Account updated successfully");
          onClose();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed')
      });
    } else {
      createCustomer.mutate(formData, {
        onSuccess: () => {
          toast.success("Corporate Account created successfully");
          onClose();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Creation failed')
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Corporate Account' : 'Add New Corporate Account'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isEdit && isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <form id="corporate-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                  <input required type="text" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Address</label>
                  <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" rows={2}></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₦)</label>
                  <input type="number" min="0" step="0.01" value={formData.credit_limit} onChange={e => setFormData({...formData, credit_limit: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition font-bold text-gray-900" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Plan (Discount)</label>
                  <select value={formData.corporate_plan_id || ''} onChange={e => setFormData({...formData, corporate_plan_id: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition font-bold">
                    <option value="">No Plan Assigned</option>
                    {allPlans.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.discount_type === 'percentage' ? `${parseFloat(p.discount_percentage)}% off` : `₦${parseFloat(p.fixed_discount).toLocaleString()} off`})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                  <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none transition" rows={2}></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" form="corporate-form" className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm">
                  {isEdit ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
