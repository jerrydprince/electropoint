import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateCustomer } from '../../hooks/useCustomers';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
}

export default function CustomerQuickAddModal({ isOpen, onClose, onSuccess }: Props) {
  const createCustomer = useCreateCustomer();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    customer_type: 'retail'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCustomer.mutate(formData, {
      onSuccess: (res) => {
        toast.success('Customer added successfully');
        onSuccess(res.data);
        setFormData({ first_name: '', last_name: '', phone: '', email: '', customer_type: 'retail' });
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error creating customer')
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Quick Add Customer</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input required type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
              <select value={formData.customer_type} onChange={e => setFormData({...formData, customer_type: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="corporate">Corporate</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createCustomer.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-red-700">
              Save Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
