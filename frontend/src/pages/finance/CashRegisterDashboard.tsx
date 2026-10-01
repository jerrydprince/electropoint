import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Lock, Unlock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

export default function CashRegisterDashboard() {
  const queryClient = useQueryClient();
  const [openingAmount, setOpeningAmount] = useState('');
  const [actualAmount, setActualAmount] = useState('');

  const { data: register, isLoading } = useQuery({
    queryKey: ['cash-register-current'],
    queryFn: async () => {
      const res = await api.get('/cash-register/current');
      return res.data.data;
    }
  });

  const openMutation = useMutation({
    mutationFn: async (amount: string) => {
      await api.post('/cash-register/open', { opening_amount: amount });
    },
    onSuccess: () => {
      toast.success("Register opened!");
      queryClient.invalidateQueries({ queryKey: ['cash-register-current'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message)
  });

  const closeMutation = useMutation({
    mutationFn: async (amount: string) => {
      const res = await api.post('/cash-register/close', { actual_amount: amount });
      return res.data.data;
    },
    onSuccess: (data) => {
      if (data.variance !== 0) {
        toast.error(`Register closed with a variance of ₦${parseFloat(data.variance).toLocaleString()}`);
      } else {
        toast.success("Register closed perfectly balanced.");
      }
      queryClient.invalidateQueries({ queryKey: ['cash-register-current'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || err.message)
  });

  if (isLoading) return <div className="p-8">Loading...</div>;

  if (!register) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-20">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={40} className="text-gray-400" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Register is Closed</h1>
          <p className="text-gray-500 mb-8">You must open the cash register with an initial float to process cash sales or expenses.</p>
          
          <div className="max-w-xs mx-auto space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 text-left mb-1">Opening Amount (₦)</label>
              <input
                type="number"
                min="0"
                value={openingAmount}
                onChange={e => setOpeningAmount(e.target.value)}
                className="w-full p-4 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
                placeholder="0.00"
              />
            </div>
            <button
              onClick={() => openMutation.mutate(openingAmount)}
              disabled={!openingAmount || openMutation.isPending}
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center justify-center disabled:opacity-50"
            >
              <Unlock size={20} className="mr-2" /> Open Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const expectedAmount = parseFloat(register.opening_amount) + register.movements.reduce((sum: number, m: any) => sum + parseFloat(m.amount), 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Active Register</h1>
          <p className="text-gray-500 mt-1">Opened at {new Date(register.opened_at).toLocaleString()}</p>
        </div>
        <Link to="/cash-register/movements" className="px-6 py-3 bg-gray-100 text-gray-800 font-bold rounded-xl hover:bg-gray-200 transition flex items-center">
          View Movements <ArrowRight size={20} className="ml-2" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Opening Float</p>
          <p className="text-3xl font-black text-gray-900">₦{parseFloat(register.opening_amount).toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Net Movements</p>
          <p className={`text-3xl font-black ${expectedAmount - parseFloat(register.opening_amount) < 0 ? 'text-red-600' : 'text-green-600'}`}>
            ₦{(expectedAmount - parseFloat(register.opening_amount)).toLocaleString()}
          </p>
        </div>
        <div className="bg-primary/5 rounded-2xl shadow-sm border border-primary/20 p-6">
          <p className="text-sm text-primary font-bold mb-1 uppercase tracking-wider">Expected Cash</p>
          <p className="text-4xl font-black text-primary">₦{expectedAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
          <Lock size={24} className="mr-2" /> Close Register
        </h2>
        
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start">
          <AlertTriangle size={24} className="text-orange-500 mr-3 shrink-0" />
          <p className="text-sm text-orange-800 font-medium">
            Closing the register will finalize today's cash block. Count the physical cash in the drawer and enter it below. Any variance from the expected amount will be recorded.
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Actual Cash in Drawer (₦)</label>
            <input
              type="number"
              min="0"
              value={actualAmount}
              onChange={e => setActualAmount(e.target.value)}
              className="w-full p-4 text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 transition"
              placeholder="0.00"
            />
          </div>

          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to close the register? This action cannot be undone.")) {
                closeMutation.mutate(actualAmount);
              }
            }}
            disabled={!actualAmount || closeMutation.isPending}
            className="w-full py-4 bg-secondary text-white font-bold rounded-xl hover:bg-black transition shadow-lg flex items-center justify-center disabled:opacity-50"
          >
            <Lock size={20} className="mr-2" /> End Shift & Close Register
          </button>
        </div>
      </div>
    </div>
  );
}
