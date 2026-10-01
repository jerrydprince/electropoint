import React, { useState, useEffect } from 'react';
import { useGoodsReceipts, useCreateGoodsReceipt } from '../../hooks/useGoodsReceipts';
import { usePurchaseOrders } from '../../hooks/useProcurement';
import { Truck, Search, Eye, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoodsReceiving() {
  const [view, setView] = useState<'list' | 'receive'>('list');
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);

  const handleReceive = (poId: string) => {
    setSelectedPoId(poId);
    setView('receive');
  };

  return (
    <div className="p-6 w-full mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Goods Receiving</h2>
          <p className="text-gray-500 mt-1">Record incoming deliveries and accept/reject items</p>
        </div>
        {view === 'receive' && (
          <button onClick={() => setView('list')} className="text-gray-600 px-4 py-2 hover:bg-gray-100 rounded-lg font-medium transition flex items-center">
            <ArrowLeft size={18} className="mr-2" /> Back to List
          </button>
        )}
      </div>

      {view === 'list' && <GRNList onReceive={handleReceive} />}
      {view === 'receive' && selectedPoId && <ReceiveWizard poId={selectedPoId} onSuccess={() => setView('list')} />}
    </div>
  );
}

function GRNList({ onReceive }: { onReceive: (poId: string) => void }) {
  const { data: grnData, isLoading: grnLoading } = useGoodsReceipts();
  const { data: poData, isLoading: poLoading } = usePurchaseOrders();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const grns = Array.isArray(grnData) ? grnData : grnData?.data || [];
  const pos = Array.isArray(poData) ? poData : poData?.data || [];

  // Pending POs are those approved or partially received
  const pendingPOs = pos.filter((po: any) => ['sent', 'approved', 'partially received'].includes(po.status));

  if (grnLoading || poLoading) return <div className="text-center py-8">Loading data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-2 px-1 font-medium ${activeTab === 'pending' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        >
          Pending Deliveries
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-1 font-medium ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'}`}
        >
          Receipt History (GRNs)
        </button>
      </div>

      {activeTab === 'pending' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">PO Ref</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Supplier</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Items</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingPOs.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No pending deliveries.</td></tr>
              ) : (
                pendingPOs.map((po: any) => (
                  <tr key={po.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{po.reference}</td>
                    <td className="p-4 text-sm text-gray-600">{po.supplier?.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-bold capitalize">{po.status}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{po.items?.length} Lines</td>
                    <td className="p-4 text-right">
                      <button onClick={() => onReceive(po.id.toString())} className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 flex items-center ml-auto">
                        <Truck size={14} className="mr-2"/> Process Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">GRN Ref</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">PO Ref</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Lines Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {grns.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No goods receipts found.</td></tr>
              ) : (
                grns.map((grn: any) => (
                  <tr key={grn.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{grn.reference}</td>
                    <td className="p-4 text-sm text-gray-600">{new Date(grn.created_at).toLocaleString()}</td>
                    <td className="p-4 text-sm text-blue-600 font-medium">{grn.purchase_order?.reference}</td>
                    <td className="p-4 text-sm text-gray-600">{grn.items?.length}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReceiveWizard({ poId, onSuccess }: { poId: string, onSuccess: () => void }) {
  const { data: poData } = usePurchaseOrders();
  const createGRN = useCreateGoodsReceipt();

  const pos = Array.isArray(poData) ? poData : poData?.data || [];
  const po = pos.find((p: any) => p.id.toString() === poId);
  
  const [items, setItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (po) {
      setItems(po.items.map((item: any) => ({
        purchase_order_item_id: item.id,
        product: item.product,
        ordered: item.quantity,
        previously_received: item.received_quantity,
        quantity_received: item.quantity - item.received_quantity,
        quantity_rejected: 0,
        rejection_reason: '',
        serials: '',
        requires_serial: item.product?.serial_tracking
      })));
    }
  }, [po]);

  if (!po) return <div>Loading PO details...</div>;

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto adjust received if rejected is typed, to ensure sum doesn't exceed remaining
    if (field === 'quantity_rejected') {
       const remaining = newItems[index].ordered - newItems[index].previously_received;
       const rejected = parseInt(value) || 0;
       if (rejected > remaining) {
           newItems[index].quantity_rejected = remaining;
           newItems[index].quantity_received = 0;
       } else {
           newItems[index].quantity_received = remaining - rejected;
       }
    }
    
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payloadItems = items.filter(i => (i.quantity_received > 0 || i.quantity_rejected > 0)).map(i => ({
      purchase_order_item_id: i.purchase_order_item_id,
      quantity_received: i.quantity_received,
      quantity_rejected: i.quantity_rejected,
      rejection_reason: i.rejection_reason,
      serials: i.requires_serial && i.quantity_received > 0 ? i.serials.split('\n').map((s: string) => s.trim()).filter((s: string) => s) : []
    }));

    if (payloadItems.length === 0) {
      toast.error("No items to receive or reject.");
      return;
    }

    createGRN.mutate({
      purchase_order_id: po.id,
      notes,
      items: payloadItems
    }, {
      onSuccess: () => {
        toast.success("Goods Receipt Note generated successfully!");
        onSuccess();
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error processing receipt')
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6 pb-4 border-b flex justify-between items-end">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Process Delivery for {po.reference}</h3>
          <p className="text-sm text-gray-500 mt-1">Supplier: {po.supplier?.name} | Warehouse: {po.warehouse?.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {items.map((item, index) => {
          const remaining = item.ordered - item.previously_received;
          if (remaining <= 0) return null;

          return (
            <div key={item.purchase_order_item_id} className="p-5 bg-gray-50 border rounded-xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="font-bold text-gray-900">{item.product?.name}</div>
                <div className="text-sm text-gray-600">
                  Ordered: <b>{item.ordered}</b> | Received: <b>{item.previously_received}</b> | Remaining: <b className="text-primary">{remaining}</b>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                <div>
                  <label className="block text-xs font-medium text-green-700 mb-1">Accept Qty</label>
                  <input type="number" min="0" max={remaining - item.quantity_rejected} value={item.quantity_received} onChange={e => handleItemChange(index, 'quantity_received', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-green-200 bg-green-50 rounded-lg focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-red-700 mb-1">Reject Qty</label>
                  <input type="number" min="0" max={remaining - item.quantity_received} value={item.quantity_rejected} onChange={e => handleItemChange(index, 'quantity_rejected', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 border border-red-200 bg-red-50 rounded-lg focus:ring-red-400" />
                </div>
                <div className="md:col-span-2">
                  {item.quantity_rejected > 0 && (
                    <>
                      <label className="block text-xs font-medium text-red-700 mb-1">Rejection Reason</label>
                      <input type="text" value={item.rejection_reason} onChange={e => handleItemChange(index, 'rejection_reason', e.target.value)} required placeholder="e.g. Damaged in transit" className="w-full px-3 py-2 border border-red-200 rounded-lg" />
                    </>
                  )}
                </div>
              </div>

              {item.requires_serial && item.quantity_received > 0 && (
                <div className="pt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center text-yellow-600">
                    <AlertCircle size={14} className="mr-1"/> Serials Required for Accepted Items ({item.quantity_received})
                  </label>
                  <textarea value={item.serials} onChange={e => handleItemChange(index, 'serials', e.target.value)} rows={3} required placeholder="One serial per line..." className="w-full px-4 py-2 border-yellow-200 bg-yellow-50 rounded-xl font-mono text-sm focus:ring-yellow-400"></textarea>
                </div>
              )}
            </div>
          );
        })}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2 border rounded-xl" placeholder="Optional notes..."></textarea>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <button type="submit" disabled={createGRN.isPending} className="bg-primary text-white px-8 py-3 rounded-xl font-medium hover:bg-red-700 shadow-sm flex items-center">
            {createGRN.isPending ? 'Processing...' : <><Check size={18} className="mr-2"/> Generate Goods Receipt</>}
          </button>
        </div>
      </form>
    </div>
  );
}
