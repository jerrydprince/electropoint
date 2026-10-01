import React, { useState } from 'react';
import { useStockTransferRequests, useCreateTransferRequest, useApproveTransferRequest, useRejectTransferRequest } from '../../hooks/useInventory';
import { useProducts } from '../../hooks/useProducts';
import { useWarehouses } from '../../hooks/useWarehouses';
import { ArrowRightLeft, AlertCircle, Plus, Check, X, Clock, FileText } from 'lucide-react';

export default function Transfers() {
  const [view, setView] = useState<'list' | 'new'>('list');

  return (
    <div className="p-6 w-full mx-auto animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock Transfers</h1>
          <p className="text-gray-500 mt-1">Manage transfer requests between locations</p>
        </div>
        {view === 'list' ? (
          <button onClick={() => setView('new')} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center shadow-sm">
            <Plus size={18} className="mr-2" />
            New Transfer Request
          </button>
        ) : (
          <button onClick={() => setView('list')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg font-medium transition">
            Cancel
          </button>
        )}
      </div>

      {view === 'list' ? <TransferRequestsList /> : <TransferWizard onSuccess={() => setView('list')} />}
    </div>
  );
}

function TransferRequestsList() {
  const { data: requests, isLoading } = useStockTransferRequests();
  const approveReq = useApproveTransferRequest();
  const rejectReq = useRejectTransferRequest();

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading requests...</div>;

  const handleApprove = (id: number) => {
    if (window.confirm("Approve this transfer? Stock will be moved instantly.")) {
      approveReq.mutate(id, {
        onSuccess: () => alert("Transfer approved successfully!"),
        onError: (err: any) => alert(err.response?.data?.message || "Error approving transfer")
      });
    }
  };

  const handleReject = (id: number) => {
    if (window.confirm("Reject this transfer?")) {
      rejectReq.mutate(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Product</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">From &rarr; To</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Qty</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {requests?.data?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <FileText className="mx-auto text-gray-300 mb-3" size={32} />
                  No transfer requests found.
                </td>
              </tr>
            ) : (
              requests?.data?.map((req: any) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{req.product?.name}</td>
                  <td className="p-4 text-sm">
                    <span className="text-red-600 font-medium">{req.from_warehouse?.name}</span>
                    <span className="mx-2 text-gray-400">&rarr;</span>
                    <span className="text-green-600 font-medium">{req.to_warehouse?.name}</span>
                  </td>
                  <td className="p-4 text-sm font-bold text-gray-700">{req.quantity}</td>
                  <td className="p-4">
                    {req.status === 'pending' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1"/> Pending</span>}
                    {req.status === 'approved' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800"><Check size={12} className="mr-1"/> Approved</span>}
                    {req.status === 'rejected' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800"><X size={12} className="mr-1"/> Rejected</span>}
                  </td>
                  <td className="p-4 text-right">
                    {req.status === 'pending' && (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleApprove(req.id)} className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Approve">
                          <Check size={16} />
                        </button>
                        <button onClick={() => handleReject(req.id)} className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Reject">
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

function TransferWizard({ onSuccess }: { onSuccess: () => void }) {
  const { data: products } = useProducts();
  const { data: warehouses } = useWarehouses();
  const createRequest = useCreateTransferRequest();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    product_id: '',
    from_warehouse_id: '',
    to_warehouse_id: '',
    quantity: '',
    reference: '',
    reason: '',
    serials: ''
  });

  const selectedProduct = products?.data?.find((p: any) => p.id.toString() === formData.product_id);
  const requiresSerials = selectedProduct?.serial_tracking;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!formData.product_id || !formData.from_warehouse_id || !formData.to_warehouse_id || !formData.quantity) {
      alert("Please fill all required fields.");
      return;
    }
    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      alert("Source and Destination warehouses cannot be the same.");
      return;
    }
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      quantity: parseInt(formData.quantity),
      serials: requiresSerials ? formData.serials.split('\n').map(s => s.trim()).filter(s => s) : []
    };

    createRequest.mutate(payload, {
      onSuccess: () => {
        alert("Transfer request created!");
        onSuccess();
      },
      onError: (err: any) => {
        alert(err.response?.data?.message || "Error creating transfer request");
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-8">
        <div className={`flex-1 h-2 rounded-l-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`}></div>
        <div className={`flex-1 h-2 rounded-r-full ml-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Step 1: Transfer Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product *</label>
              <select name="product_id" value={formData.product_id} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20">
                <option value="">-- Select Product --</option>
                {products?.data?.map((p: any) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end relative">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Warehouse *</label>
                <select name="from_warehouse_id" value={formData.from_warehouse_id} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 bg-red-50/50">
                  <option value="">-- Select Source --</option>
                  {warehouses?.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-1 w-8 h-8 bg-gray-100 rounded-full items-center justify-center border border-gray-200 z-10">
                <ArrowRightLeft size={14} className="text-gray-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Warehouse *</label>
                <select name="to_warehouse_id" value={formData.to_warehouse_id} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 bg-green-50/50">
                  <option value="">-- Select Destination --</option>
                  {warehouses?.map((w: any) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transfer Quantity *</label>
                <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" placeholder="e.g. 10" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <input type="text" name="reason" value={formData.reason} onChange={handleChange} placeholder="e.g. Restocking" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="button" onClick={handleNext} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition">
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Step 2: Serial Validation & Confirmation</h3>
            
            {requiresSerials ? (
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                <div className="flex items-start mb-2">
                  <AlertCircle className="text-yellow-600 mt-0.5 mr-2" size={16} />
                  <label className="block text-sm font-medium text-yellow-800">Serial Numbers Required</label>
                </div>
                <p className="text-xs text-yellow-700 mb-3">This product requires serial tracking. Enter exactly <b>{parseInt(formData.quantity) || 0}</b> serial number(s) to transfer, one per line.</p>
                <textarea 
                  name="serials" 
                  value={formData.serials} 
                  onChange={handleChange} 
                  rows={6} 
                  required 
                  placeholder="SN-001&#10;SN-002&#10;SN-003"
                  className="w-full px-4 py-2 border border-yellow-200 rounded-xl focus:ring-2 focus:ring-yellow-400 bg-white font-mono"
                ></textarea>
              </div>
            ) : (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-blue-800 text-sm">
                This product does not require serial tracking. You are ready to submit the transfer request.
              </div>
            )}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                Back
              </button>
              <button type="submit" disabled={createRequest.isPending} className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center disabled:opacity-50 shadow-sm">
                {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
