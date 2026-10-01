import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function CreateExpense() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    expense_category_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: ''
  });

  const { data: categories } = useQuery({
    queryKey: ['expense-categories'],
    queryFn: async () => {
      const res = await api.get('/expense-categories');
      return res.data.data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/expenses', data);
      
      // Auto-log to cash register
      try {
        await api.post('/cash-register/movement', {
          type: 'cash_out',
          amount: data.amount,
          reference: 'Expense Log',
          notes: data.notes
        });
        toast.success("Cash out recorded in active register.");
      } catch (err: any) {
        toast.error("Note: " + (err.response?.data?.message || err.message));
      }

      return res.data.data;
    },
    onSuccess: () => {
      toast.success('Expense logged successfully');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      navigate('/finance/expenses');
    }
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Link to="/finance/expenses" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-bold mb-6 transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Expenses
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-black text-gray-900 mb-6">Log New Expense</h1>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
            <select
              required
              value={formData.expense_category_id}
              onChange={e => setFormData({...formData, expense_category_id: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
            >
              <option value="">Select Category</option>
              {categories?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Amount (₦) *</label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Reference / Receipt #</label>
            <input
              type="text"
              value={formData.reference}
              onChange={e => setFormData({...formData, reference: e.target.value})}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              rows={3}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => submitMutation.mutate(formData)}
              disabled={!formData.expense_category_id || !formData.amount || submitMutation.isPending}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center disabled:opacity-50"
            >
              <Save size={20} className="mr-2" /> Save Expense
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
