import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { Plus } from 'lucide-react';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    account_group_id: '',
    description: ''
  });

    const fetchAccountsAndGroups = async () => {
      try {
        const [accountsRes, groupsRes] = await Promise.all([
          api.get('/chart-of-accounts'),
          api.get('/account-groups')
        ]);
        setAccounts(accountsRes.data.data);
        setGroups(groupsRes.data.data);
      } catch (error) {
        console.error("Failed to fetch data", error);
        toast.error("Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    fetchAccountsAndGroups();
  }, []);

  const toggleStatus = async (id: number) => {
    try {
      await api.put(`/chart-of-accounts/${id}/toggle-status`);
      toast.success("Account status updated");
      // update local state
      setAccounts((prev: any) => prev.map((acc: any) => acc.id === id ? { ...acc, status: !acc.status } : acc));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update account status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/chart-of-accounts', formData);
      toast.success("Account created successfully");
      setIsModalOpen(false);
      setFormData({ code: '', name: '', account_group_id: '', description: '' });
      
      // Refresh list
      const response = await api.get('/chart-of-accounts');
      setAccounts(response.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-500 dark:text-gray-600">Master list of all general ledger accounts.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-red-700 flex items-center shadow-lg shadow-red-500/20 transition font-medium"
        >
          <Plus size={18} className="mr-2" />
          Create Account
        </button>
      </div>

      <div className="bg-white dark:bg-slate-50 rounded-xl border border-gray-200 dark:border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-900">Accounts</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-100 dark:text-gray-700">
                  <tr>
                    <th className="px-6 py-3">Code</th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((acc: any) => (
                    <tr key={acc.id} className="bg-white border-b dark:bg-slate-50 dark:border-gray-200">
                      <td className="px-6 py-4 font-mono font-medium">{acc.code}</td>
                      <td className="px-6 py-4">{acc.name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-slate-200 dark:text-gray-800">
                          {acc.group?.type?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${acc.status ? 'bg-green-100 text-green-800 dark:bg-green-100 dark:text-green-800' : 'bg-gray-100 text-gray-800 dark:bg-slate-200 dark:text-gray-800'}`}>
                          {acc.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!acc.is_system_account && (
                          <button
                            onClick={() => toggleStatus(acc.id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                              acc.status 
                                ? 'text-red-600 hover:bg-red-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {acc.status ? 'Deactivate' : 'Activate'}
                          </button>
                        )}
                        {acc.is_system_account && (
                          <span className="text-xs text-gray-400 italic">System Account</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        No accounts found. Run the ChartOfAccountsSeeder.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-sm w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">Create New Account</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Code</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="w-full border-gray-300 rounded-sm focus:ring-primary focus:border-primary px-3 py-2" placeholder="e.g. 5100" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-sm focus:ring-primary focus:border-primary px-3 py-2" placeholder="e.g. Marketing Expense" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Group</label>
                <select required value={formData.account_group_id} onChange={e => setFormData({...formData, account_group_id: e.target.value})} className="w-full border-gray-300 rounded-sm focus:ring-primary focus:border-primary px-3 py-2">
                  <option value="">Select Group</option>
                  {groups.map((g: any) => (
                    <option key={g.id} value={g.id}>{g.name} ({g.type?.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-gray-300 rounded-sm focus:ring-primary focus:border-primary px-3 py-2" rows={3}></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-sm font-medium transition">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-primary text-white hover:bg-red-700 rounded-sm font-medium transition">Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;
