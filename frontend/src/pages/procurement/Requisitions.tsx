import React, { useState } from 'react';
import { usePurchaseRequisitions, useCreatePurchaseRequisition, useUpdatePurchaseRequisitionStatus } from '../../hooks/useProcurement';
import { useProducts } from '../../hooks/useProducts';
import { useBranches } from '../../hooks/useBranches';
import { Plus, Check, X, ArrowLeft, Trash2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Requisitions() {
  const [view, setView] = useState<'list' | 'new'>('list');

  return (
    <div className="p-6 w-full mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Purchase Requisitions</h2>
          <p className="text-gray-500 mt-1">Request new stock purchases</p>
        </div>
        {view === 'list' ? (
          <button onClick={() => setView('new')} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center shadow-sm">
            <Plus size={18} className="mr-2" /> New Requisition
          </button>
        ) : (
          <button onClick={() => setView('list')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg font-medium transition flex items-center">
            <ArrowLeft size={18} className="mr-2" /> Back to List
          </button>
        )}
      </div>

      {view === 'list' ? <PRList /> : <PRForm onSuccess={() => setView('list')} />}
    </div>
  );
}

function PRList() {
  const { data: prData, isLoading } = usePurchaseRequisitions();
  const updateStatus = useUpdatePurchaseRequisitionStatus();

  if (isLoading) return <div className="text-center py-8">Loading requisitions...</div>;
  const requisitions = prData?.data || [];

  const handleStatus = (id: string, status: string) => {
    if (window.confirm(`Mark this requisition as ${status}?`)) {
      updateStatus.mutate({ id, status }, {
        onSuccess: () => toast.success(`Requisition ${status}!`),
        onError: (err: any) => toast.error(err.response?.data?.message || 'Error updating status')
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Ref</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Branch</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Items</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requisitions.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <FileText className="mx-auto text-gray-300 mb-3" size={32} />
                  No purchase requisitions found.
                </td>
              </tr>
            ) : (
              requisitions.map((pr: any) => (
                <tr key={pr.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-gray-900">{pr.reference}</td>
                  <td className="p-4 text-sm text-gray-600">{new Date(pr.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-gray-700">{pr.branch?.name}</td>
                  <td className="p-4 text-sm text-gray-700">
                    {pr.items?.length || 0} item(s)
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      pr.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      pr.status === 'approved' ? 'bg-green-100 text-green-800' :
                      pr.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {pr.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    {pr.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleStatus(pr.id.toString(), 'approved')} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Approve">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleStatus(pr.id.toString(), 'rejected')} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Reject">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PRForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: branchesData } = useBranches();
  const { data: productsData } = useProducts();
  const createPR = useCreatePurchaseRequisition();

  const [formData, setFormData] = useState({
    branch_id: '',
    notes: '',
    items: [{ product_id: '', quantity: 1, expected_date: '' }]
  });

  const branches = Array.isArray(branchesData) ? branchesData : branchesData?.data || [];
  const products = Array.isArray(productsData) ? productsData : productsData?.data || [];

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1, expected_date: '' }] });
  const removeItem = (index: number) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPR.mutate(formData, {
      onSuccess: () => {
        toast.success("Requisition submitted successfully!");
        onSuccess();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error submitting PR')
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Requesting Branch *</label>
            <select value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} required className="w-full px-4 py-2 border rounded-xl focus:ring-primary/20">
              <option value="">-- Select Branch --</option>
              {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Reason</label>
            <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-primary/20" />
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Requested Items</h3>
            <button type="button" onClick={addItem} className="text-primary text-sm font-medium flex items-center hover:underline">
              <Plus size={16} className="mr-1" /> Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product *</label>
                  <select value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)} required className="w-full px-3 py-2 border rounded-lg">
                    <option value="">-- Select Product --</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Quantity *</label>
                  <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value))} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Expected Date</label>
                  <input type="date" value={item.expected_date} onChange={e => handleItemChange(index, 'expected_date', e.target.value)} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition mb-1">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <button type="submit" disabled={createPR.isPending} className="bg-primary text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 shadow-sm disabled:opacity-50">
            {createPR.isPending ? 'Submitting...' : 'Submit Requisition'}
          </button>
        </div>
      </form>
    </div>
  );
}
