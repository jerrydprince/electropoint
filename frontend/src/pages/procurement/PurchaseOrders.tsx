import React, { useState } from 'react';
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrderStatus, useReceiveGoods, usePurchaseRequisitions } from '../../hooks/useProcurement';
import { useSuppliers } from '../../hooks/useSuppliers';
import { useBranches } from '../../hooks/useBranches';
import { useWarehouses } from '../../hooks/useWarehouses';
import { useProducts } from '../../hooks/useProducts';
import { Plus, ArrowLeft, ShoppingCart, Truck, Check, AlertCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PurchaseOrders() {
  const [view, setView] = useState<'list' | 'new'>('list');

  return (
    <div className="p-6 w-full mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Purchase Orders</h2>
          <p className="text-gray-500 mt-1">Manage POs and receive goods</p>
        </div>
        {view === 'list' ? (
          <button onClick={() => setView('new')} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center shadow-sm">
            <Plus size={18} className="mr-2" /> Create PO
          </button>
        ) : (
          <button onClick={() => setView('list')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg font-medium transition flex items-center">
            <ArrowLeft size={18} className="mr-2" /> Back to List
          </button>
        )}
      </div>

      {view === 'list' && <POList />}
      {view === 'new' && <POForm onSuccess={() => setView('list')} />}
    </div>
  );
}

function POList() {
  const { data: poData, isLoading } = usePurchaseOrders();
  const updateStatus = useUpdatePurchaseOrderStatus();

  if (isLoading) return <div className="text-center py-8">Loading purchase orders...</div>;
  const pos = poData?.data || [];

  const handleStatus = (id: string, status: string) => {
    if (window.confirm(`Mark this PO as ${status}?`)) {
      updateStatus.mutate({ id, status }, {
        onSuccess: () => toast.success(`PO ${status}!`),
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
              <th className="p-4 font-semibold text-gray-600 text-sm">Supplier</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Total</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  <ShoppingCart className="mx-auto text-gray-300 mb-3" size={32} />
                  No purchase orders found.
                </td>
              </tr>
            ) : (
              pos.map((po: any) => (
                <tr key={po.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-gray-900">{po.reference}</td>
                  <td className="p-4 text-sm text-gray-600">{new Date(po.created_at).toLocaleDateString()}</td>
                  <td className="p-4 text-sm text-gray-700">{po.supplier?.name}</td>
                  <td className="p-4 text-sm font-bold text-gray-900 text-right">₦{parseFloat(po.total_amount).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold capitalize ${
                      ['draft', 'pending approval'].includes(po.status) ? 'bg-yellow-100 text-yellow-800' :
                      ['approved', 'sent'].includes(po.status) ? 'bg-blue-100 text-blue-800' :
                      ['partially received', 'fully received'].includes(po.status) ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {po.status === 'draft' && <button onClick={() => handleStatus(po.id.toString(), 'approved')} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200">Approve</button>}
                      {po.status === 'approved' && <button onClick={() => handleStatus(po.id.toString(), 'sent')} className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-100">Mark Sent</button>}
                      {['sent', 'partially received'].includes(po.status) && (
                        <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded flex items-center">
                          <Truck size={12} className="mr-1"/> Awaiting Receipt
                        </span>
                      )}
                    </div>
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

function POForm({ onSuccess }: { onSuccess: () => void }) {
  const { data: suppliersData } = useSuppliers();
  const { data: branchesData } = useBranches();
  const { data: warehouses } = useWarehouses();
  const { data: productsData } = useProducts();
  const { data: requisitionsData } = usePurchaseRequisitions({ status: 'approved' }); // Only approved PRs
  const createPO = useCreatePurchaseOrder();

  const [formData, setFormData] = useState({
    supplier_id: '',
    branch_id: '',
    warehouse_id: '',
    purchase_requisition_id: '',
    tax_amount: 0,
    discount_amount: 0,
    expected_delivery: '',
    payment_terms: '',
    notes: '',
    items: [{ product_id: '', quantity: 1, unit_cost: 0 }]
  });

  const suppliers = Array.isArray(suppliersData) ? suppliersData : suppliersData?.data || [];
  const branches = Array.isArray(branchesData) ? branchesData : branchesData?.data || [];
  const products = Array.isArray(productsData) ? productsData : productsData?.data || [];
  const prs = requisitionsData?.data || [];

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { product_id: '', quantity: 1, unit_cost: 0 }] });
  const removeItem = (index: number) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  // Auto-fill from PR
  const handlePRChange = (prId: string) => {
    const pr = prs.find((p: any) => p.id.toString() === prId);
    if (pr) {
      setFormData({
        ...formData,
        purchase_requisition_id: prId,
        branch_id: pr.branch_id,
        items: pr.items.map((item: any) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.product?.cost_price || 0
        }))
      });
    } else {
      setFormData({ ...formData, purchase_requisition_id: '' });
    }
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0);
  const total = subtotal + formData.tax_amount - formData.discount_amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPO.mutate(formData, {
      onSuccess: () => {
        toast.success("PO created successfully!");
        onSuccess();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error creating PO')
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Load from Requisition (Optional)</label>
            <select value={formData.purchase_requisition_id} onChange={e => handlePRChange(e.target.value)} className="w-full px-4 py-2 border rounded-xl bg-gray-50 focus:ring-primary/20">
              <option value="">-- No PR Linked --</option>
              {prs.map((pr: any) => <option key={pr.id} value={pr.id}>{pr.reference} - {pr.branch?.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier *</label>
            <select value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})} required className="w-full px-4 py-2 border rounded-xl focus:ring-primary/20">
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch *</label>
            <select value={formData.branch_id} onChange={e => setFormData({...formData, branch_id: e.target.value})} required className="w-full px-4 py-2 border rounded-xl focus:ring-primary/20">
              <option value="">-- Select Branch --</option>
              {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receiving Warehouse *</label>
            <select value={formData.warehouse_id} onChange={e => setFormData({...formData, warehouse_id: e.target.value})} required className="w-full px-4 py-2 border rounded-xl focus:ring-primary/20">
              <option value="">-- Select Warehouse --</option>
              {warehouses?.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Line Items</h3>
            <button type="button" onClick={addItem} className="text-primary text-sm font-medium flex items-center hover:underline">
              <Plus size={16} className="mr-1" /> Add Line
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Product *</label>
                  <select value={item.product_id} onChange={e => handleItemChange(index, 'product_id', e.target.value)} required className="w-full px-3 py-2 border rounded-lg">
                    <option value="">-- Select Product --</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qty *</label>
                  <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Unit Cost (₦) *</label>
                  <input type="number" min="0" step="0.01" value={item.unit_cost} onChange={e => handleItemChange(index, 'unit_cost', parseFloat(e.target.value) || 0)} required className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div className="w-32 pb-2 text-right">
                  <span className="text-xs text-gray-500 block">Line Total</span>
                  <span className="font-bold text-gray-900">₦{((item.quantity || 0) * (item.unit_cost || 0)).toLocaleString()}</span>
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

        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
              <input type="date" value={formData.expected_delivery} onChange={e => setFormData({...formData, expected_delivery: e.target.value})} className="w-full px-4 py-2 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
              <input type="text" value={formData.payment_terms} onChange={e => setFormData({...formData, payment_terms: e.target.value})} placeholder="e.g. Net 30" className="w-full px-4 py-2 border rounded-xl" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-600">Tax</span>
              <input type="number" min="0" step="0.01" value={formData.tax_amount} onChange={e => setFormData({...formData, tax_amount: parseFloat(e.target.value) || 0})} className="w-24 px-2 py-1 border rounded text-right" />
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-600">Discount</span>
              <input type="number" min="0" step="0.01" value={formData.discount_amount} onChange={e => setFormData({...formData, discount_amount: parseFloat(e.target.value) || 0})} className="w-24 px-2 py-1 border rounded text-right" />
            </div>
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-primary">₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button type="submit" disabled={createPO.isPending} className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 shadow-sm disabled:opacity-50">
            {createPO.isPending ? 'Saving...' : 'Create Purchase Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
