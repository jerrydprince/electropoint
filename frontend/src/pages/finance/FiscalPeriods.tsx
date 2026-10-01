import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Calendar, Plus, CheckCircle, Lock } from 'lucide-react';

const FiscalPeriods = () => {
  const [periods, setPeriods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    start_date: '',
    end_date: ''
  });

  const fetchPeriods = async () => {
    try {
      const response = await api.get('/fiscal-periods');
      setPeriods(response.data.data);
    } catch (error) {
      console.error("Failed to fetch periods", error);
      toast.error("Failed to fetch fiscal periods");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/fiscal-periods', formData);
      toast.success("Fiscal period created successfully");
      setIsModalOpen(false);
      setFormData({ name: '', start_date: '', end_date: '' });
      fetchPeriods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create period");
    }
  };

  const handleClose = async (id: number) => {
    if (!window.confirm("Are you sure you want to close this fiscal period? This action cannot be undone.")) return;
    try {
      await api.post(`/fiscal-periods/${id}/close`);
      toast.success("Fiscal period closed successfully");
      fetchPeriods();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to close period");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-900">Fiscal Periods</h1>
          <p className="text-gray-500 dark:text-gray-600">Manage your accounting and budget periods.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-red-700 flex items-center shadow-lg shadow-red-500/20 transition font-medium"
        >
          <Plus size={18} className="mr-2" />
          Create Period
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-gray-500">Loading fiscal periods...</div>
        ) : periods.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">No fiscal periods created yet.</div>
        ) : (
          periods.map((period: any) => (
            <div key={period.id} className="bg-white dark:bg-slate-50 rounded-2xl border border-gray-200 shadow-sm p-6 relative overflow-hidden">
              {period.status === 'closed' && (
                <div className="absolute top-0 right-0 bg-gray-100 px-3 py-1 rounded-bl-lg border-b border-l border-gray-200 flex items-center">
                  <Lock size={12} className="mr-1 text-gray-500" />
                  <span className="text-xs font-bold text-gray-600 uppercase">Closed</span>
                </div>
              )}
              {period.status === 'open' && (
                <div className="absolute top-0 right-0 bg-green-100 px-3 py-1 rounded-bl-lg border-b border-l border-green-200 flex items-center">
                  <CheckCircle size={12} className="mr-1 text-green-600" />
                  <span className="text-xs font-bold text-green-700 uppercase">Open</span>
                </div>
              )}
              
              <div className="flex items-center mb-4 mt-2">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl mr-4">
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{period.name}</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {format(new Date(period.start_date), 'MMM d, yyyy')} - {format(new Date(period.end_date), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {period.status === 'open' && (
                <div className="mt-6 border-t border-gray-100 pt-4 text-right">
                  <button 
                    onClick={() => handleClose(period.id)}
                    className="text-sm font-semibold text-gray-600 hover:text-red-600 transition"
                  >
                    Close Period
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-sm w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">New Fiscal Period</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Period Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-sm focus:ring-primary focus:border-primary px-3 py-2" placeholder="e.g. Q3 2026" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input required type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border-gray-300 rounded-sm focus:ring-primary focus:border-primary px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input required type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border-gray-300 rounded-sm focus:ring-primary focus:border-primary px-3 py-2" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm font-medium transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white hover:bg-red-700 rounded-sm font-medium transition">Create Period</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiscalPeriods;
