import React, { useState } from 'react';
import { useSupplyRequests, useCreateSupplyRequest, useSupplies } from '../../hooks/useSupplies';
import { useBranches } from '../../hooks/useBranches';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplyRequests() {
  const { data: requestsData, isLoading: loadingRequests } = useSupplyRequests();
  const { data: supplies } = useSupplies();
  const { data: branches } = useBranches();
  const createRequest = useCreateSupplyRequest();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    branch_id: '',
    notes: '',
    items: [{ supply_id: '', quantity_requested: '' }]
  });

  const requests = Array.isArray(requestsData) ? requestsData : requestsData?.data || [];

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { supply_id: '', quantity_requested: '' }]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items] as any;
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.branch_id) return toast.error("Select your branch");
    if (formData.items.some(i => !i.supply_id || !i.quantity_requested)) return toast.error("Fill all item fields");

    createRequest.mutate(formData, {
      onSuccess: () => {
        toast.success("Supply request submitted");
        setShowForm(false);
        setFormData({ branch_id: '', notes: '', items: [{ supply_id: '', quantity_requested: '' }] });
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error submitting request')
    });
  };

  if (loadingRequests) return <div className="text-center py-8">Loading requests...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">My Supply Requests</h2>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-700 flex inline-flex items-center">
          <Plus size={16} className="mr-1" /> Request Supplies
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border mb-6">
          <h3 className="font-bold text-gray-900 mb-4">New Request</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requesting Branch</label>
              <select required value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} className="w-full p-2 border rounded-lg">
                <option value="">Select Branch</option>
                {branches?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Notes</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="e.g. Monthly office supplies" />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <label className="block text-sm font-medium text-gray-700">Supplies Needed</label>
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <select required value={item.supply_id} onChange={e => handleItemChange(index, 'supply_id', e.target.value)} className="flex-1 p-2 border rounded-lg">
                  <option value="">Select Supply</option>
                  {supplies?.map((s: any) => <option key={s.id} value={s.id}>{s.name} ({s.unit})</option>)}
                </select>
                <input required type="number" min="1" placeholder="Qty" value={item.quantity_requested} onChange={e => handleItemChange(index, 'quantity_requested', e.target.value)} className="w-32 p-2 border rounded-lg" />
                {formData.items.length > 1 && (
                  <button type="button" onClick={() => handleRemoveItem(index)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">Remove</button>
                )}
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="text-sm font-medium text-primary hover:text-red-700">+ Add Item</button>
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white border rounded-lg text-sm">Cancel</button>
            <button type="submit" disabled={createRequest.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Submit Request</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500 border rounded-xl">No requests found.</div>
        ) : (
          requests.map((req: any) => (
            <div key={req.id} className="border rounded-xl p-6 bg-white shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-gray-900">Request #{req.id} - {req.branch?.name}</h4>
                  <p className="text-sm text-gray-500">Requested by: {req.user?.name} | {new Date(req.created_at).toLocaleString()}</p>
                  <p className="text-sm text-gray-600 mt-1">{req.notes}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                  ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    req.status === 'partially_issued' ? 'bg-purple-100 text-purple-800' :
                    req.status === 'fully_issued' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'}`}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>
              <table className="w-full text-left text-sm border-t pt-4">
                <thead className="text-gray-500">
                  <tr>
                    <th className="py-2">Item</th>
                    <th className="py-2 text-right">Requested</th>
                    <th className="py-2 text-right">Issued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {req.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-2 font-medium text-gray-900">{item.supply?.name}</td>
                      <td className="py-2 text-right">{item.quantity_requested} {item.supply?.unit}</td>
                      <td className="py-2 text-right text-green-600 font-bold">{item.quantity_issued}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
