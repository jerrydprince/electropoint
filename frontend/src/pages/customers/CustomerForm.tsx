import React, { useState, useEffect } from 'react';
import { useCreateCustomer, useUpdateCustomer, useCustomer, useCustomers } from '../../hooks/useCustomers';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId?: string | number | null;
}

export default function CustomerForm({ isOpen, onClose, customerId }: Props) {
  const isEdit = !!customerId;

  const { data: customer, isLoading } = useCustomer(customerId ? String(customerId) : undefined);
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const [formData, setFormData] = useState({
    title: '', first_name: '', last_name: '', company_name: '',
    phone: '', email: '', address: '', customer_type: 'retail',
    credit_limit: 0, notes: '', status: 'active', corporate_account_id: ''
  });

  const { data: customersData } = useCustomers();
  const allCustomers = Array.isArray(customersData) ? customersData : customersData?.data || [];
  const corporateAccounts = allCustomers.filter((c: any) => c.customer_type === 'corporate');

  useEffect(() => {
    if (isOpen) {
      if (isEdit && customer) {
        setFormData({
          title: customer.title || '',
        first_name: customer.first_name || '',
        last_name: customer.last_name || '',
        company_name: customer.company_name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        customer_type: customer.customer_type || 'retail',
        credit_limit: customer.credit_limit || 0,
        notes: customer.notes || '',
        status: customer.status || 'active',
        corporate_account_id: customer.corporate_account_id || ''
      });
    } else if (!isEdit) {
      setFormData({
        title: '', first_name: '', last_name: '', company_name: '',
        phone: '', email: '', address: '', customer_type: 'retail',
        credit_limit: 0, notes: '', status: 'active', corporate_account_id: ''
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
          toast.success("Customer updated successfully");
          onClose();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed')
      });
    } else {
      createCustomer.mutate(formData, {
        onSuccess: () => {
          toast.success("Customer created successfully");
          onClose();
        },
        onError: (err: any) => toast.error(err.response?.data?.message || 'Creation failed')
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {isEdit && isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <form id="customer-form" onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="md:col-span-2 grid grid-cols-4 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Mr/Mrs/Dr" />
            </div>
            <div className="col-span-3 md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full p-2 border rounded-lg" />
            </div>
            <div className="col-span-4 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full p-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input type="text" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full p-2 border rounded-lg" />
          </div>


          {formData.customer_type === 'retail' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Corporate Organization</label>
              <select value={formData.corporate_account_id} onChange={e => setFormData({...formData, corporate_account_id: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="">None (Individual Customer)</option>
                {corporateAccounts.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.company_name || c.first_name + ' ' + c.last_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full p-2 border rounded-lg" rows={2}></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit (₦)</label>
            <input type="number" min="0" step="0.01" value={formData.credit_limit} onChange={e => setFormData({...formData, credit_limit: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full p-2 border rounded-lg">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded-lg" rows={3}></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" form="customer-form" className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm">
                {isEdit ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
