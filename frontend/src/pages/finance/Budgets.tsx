import React, { useState, useEffect } from "react";
import api from "../../lib/axios";
import { format } from "date-fns";
import { Plus, BarChart2, Edit2, Trash2, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

const Budgets = () => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [branches, setBranches] = useState<any[]>([]);
  const [fiscalPeriods, setFiscalPeriods] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    fiscal_period_id: '',
    branch_id: '',
    status: 'draft',
    lines: [] as { account_id: string, amount: string }[]
  });

  useEffect(() => {
    fetchBudgets();
    fetchDependencies();
  }, []);

  const fetchDependencies = async () => {
    try {
      // Typically we'd have dedicated endpoints, assuming these exist based on existing POS module
      const resBranches = await api.get('/branches');
      setBranches(resBranches.data.data || []);

      const resAccounts = await api.get('/chart-of-accounts');
      setAccounts(resAccounts.data.data?.filter((a: any) => a.group?.type?.name === 'Expenses') || []); // filter to expenses
      
      try {
        const resPeriods = await api.get('/fiscal-periods');
        // Only allow open periods for budget creation
        setFiscalPeriods(resPeriods.data.data?.filter((p: any) => p.status === 'open') || []);
      } catch (e) {
        console.error("Failed to load fiscal periods", e);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBudgets = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/budgets');
      if (data.success) {
        setBudgets(data.data);
      }
    } catch (error) {
      console.error("Failed to load budgets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: '', amount: '' }]
    });
  };

  const handleLineChange = (index: number, field: string, value: string) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const handleRemoveLine = (index: number) => {
    const newLines = [...formData.lines];
    newLines.splice(index, 1);
    setFormData({ ...formData, lines: newLines });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        branch_id: formData.branch_id || null, // null for global
      };
      const { data } = await api.post('/budgets', payload);
      if (data.success) {
        toast.success("Budget created successfully");
        setIsModalOpen(false);
        fetchBudgets();
        setFormData({ name: '', fiscal_period_id: '', branch_id: '', status: 'draft', lines: [] });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create budget");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-900">Budgets</h1>
          <p className="text-gray-500 dark:text-gray-600">Track real-time utilization of allocated funds per branch.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-red-700 flex items-center shadow-lg shadow-red-500/20 transition font-medium"
        >
          <Plus size={18} className="mr-2" />
          Create Budget
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-12 text-gray-500">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-500">No active budgets. Create one to start tracking.</div>
        ) : (
          budgets.map((budget: any) => (
            <div key={budget.id} className="bg-white dark:bg-slate-50 rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{budget.name}</h2>
                    <p className="text-sm text-gray-500 mt-1 flex items-center">
                      <Clock size={14} className="mr-1" />
                      {budget.fiscal_period?.name || 'Unknown Period'} 
                      {budget.branch ? ` • ${budget.branch.name}` : ' • Global (All Branches)'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                    budget.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {budget.status}
                  </span>
                </div>

                <div className="space-y-6 mt-6">
                  {budget.lines.map((line: any) => (
                    <div key={line.id}>
                      <div className="flex justify-between items-end mb-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{line.account?.name}</p>
                          <p className="text-xs text-gray-500">{line.account?.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">₦{Number(line.actual_amount).toLocaleString()} <span className="text-gray-400 font-normal">/ ₦{Number(line.amount).toLocaleString()}</span></p>
                          <p className="text-xs font-medium mt-0.5" style={{ color: line.utilization_percentage > 90 ? '#ef4444' : line.utilization_percentage > 75 ? '#f59e0b' : '#10b981' }}>
                            {line.utilization_percentage}% Utilized
                          </p>
                        </div>
                      </div>
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className="h-2.5 rounded-full transition-all duration-1000"
                          style={{ 
                            width: `${Math.min(100, line.utilization_percentage)}%`,
                            backgroundColor: line.utilization_percentage > 90 ? '#ef4444' : line.utilization_percentage > 75 ? '#f59e0b' : 'hsl(var(--primary))'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold">New Budget Allocation</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded-xl focus:ring-primary focus:border-primary" placeholder="e.g. Q3 Marketing Budget" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiscal Period</label>
                  <select required value={formData.fiscal_period_id} onChange={e => setFormData({...formData, fiscal_period_id: e.target.value})} className="w-full border-gray-300 rounded-xl focus:ring-primary focus:border-primary">
                    <option value="">Select Period</option>
                    {fiscalPeriods.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.start_date} to {p.end_date})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Branch (Optional)</label>
                  <select value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} className="w-full border-gray-300 rounded-xl focus:ring-primary focus:border-primary">
                    <option value="">Global (All Branches)</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">Allocations</h3>
                  <button type="button" onClick={handleAddLine} className="text-primary text-sm font-medium flex items-center hover:text-red-700">
                    <Plus size={16} className="mr-1" /> Add Account
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.lines.map((line, idx) => (
                    <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex-1">
                        <select required value={line.account_id} onChange={e => handleLineChange(idx, 'account_id', e.target.value)} className="w-full border-gray-300 rounded-lg text-sm">
                          <option value="">Select Expense Account</option>
                          {accounts.map(a => (
                            <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <input type="number" required min="1" step="0.01" value={line.amount} onChange={e => handleLineChange(idx, 'amount', e.target.value)} placeholder="Amount (₦)" className="w-full border-gray-300 rounded-lg text-sm" />
                      </div>
                      <button type="button" onClick={() => handleRemoveLine(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  {formData.lines.length === 0 && (
                    <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      No accounts allocated. Click "Add Account" to allocate funds.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl mr-3">Cancel</button>
                <button type="submit" disabled={formData.lines.length === 0} className="px-6 py-2 bg-primary text-white font-medium rounded-xl hover:bg-red-700 disabled:opacity-50">Create Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
