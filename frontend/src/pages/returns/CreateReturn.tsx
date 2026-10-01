import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, CheckCircle, PackageX } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../lib/axios';

export default function CreateReturn() {
  const navigate = useNavigate();
  const [searchInvoice, setSearchInvoice] = useState('');
  const [sale, setSale] = useState<any>(null);
  
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [notes, setNotes] = useState('');

  const searchMutation = useMutation({
    mutationFn: async (invoiceNumber: string) => {
      const res = await api.get('/sales-history', { params: { search: invoiceNumber } });
      const sales = Array.isArray(res.data.data) ? res.data.data : res.data.data?.data || [];
      
      if (sales && sales.length > 0) {
        // Find exact match
        const exact = sales.find((s: any) => s.invoice_number.toLowerCase() === invoiceNumber.toLowerCase());
        if (exact) return exact;
        return sales[0];
      }
      throw new Error('Invoice not found');
    },
    onSuccess: (data) => {
      setSale(data);
      // Initialize return items map
      const initialItems = data.items.map((item: any) => ({
        sale_item_id: item.id,
        product_name: item.product?.name,
        max_qty: item.quantity,
        quantity: 0,
        reason: '',
        condition: 'good'
      }));
      setReturnItems(initialItems);
      toast.success('Invoice found!');
    },
    onError: () => {
      toast.error('Invoice not found');
      setSale(null);
    }
  });

  const submitReturn = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/returns', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Return initiated successfully!');
      navigate('/returns');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to process return');
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInvoice.trim()) {
      searchMutation.mutate(searchInvoice.trim());
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setReturnItems(items => items.map(item => 
      item.sale_item_id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = () => {
    const activeItems = returnItems.filter(item => item.quantity > 0);
    if (activeItems.length === 0) {
      toast.error('Please select at least one item to return');
      return;
    }

    // Validate reasons
    const missingReasons = activeItems.some(item => !item.reason.trim());
    if (missingReasons) {
      toast.error('Please provide a reason for all returned items');
      return;
    }

    submitReturn.mutate({
      sale_id: sale.id,
      notes: notes,
      items: activeItems.map(item => ({
        sale_item_id: item.sale_item_id,
        quantity: item.quantity,
        reason: item.reason,
        condition: item.condition
      }))
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center mb-8">
        <button onClick={() => navigate('/returns')} className="mr-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Initiate Return</h1>
          <p className="text-gray-500 mt-1">Process a customer return and refund.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Lookup Invoice</label>
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              value={searchInvoice}
              onChange={e => setSearchInvoice(e.target.value)}
              placeholder="e.g. INV-12345678"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono text-lg"
            />
          </div>
          <button 
            type="submit"
            disabled={searchMutation.isPending}
            className="px-8 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition flex items-center"
          >
            {searchMutation.isPending ? 'Searching...' : 'Find Sale'}
          </button>
        </form>
      </div>

      {sale && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
          <div className="bg-gray-50 p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Invoice Details</p>
              <h2 className="text-2xl font-black text-gray-900 font-mono">{sale.invoice_number}</h2>
              <p className="text-gray-600 mt-1">Customer: <span className="font-semibold">{sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : 'Walk-in'}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Grand Total</p>
              <p className="text-2xl font-black text-gray-900">₦{parseFloat(sale.grand_total).toLocaleString()}</p>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <PackageX className="mr-2 text-primary" size={20} />
              Select Items to Return
            </h3>
            
            <div className="space-y-4 mb-8">
              {returnItems.map(item => (
                <div key={item.sale_item_id} className="flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{item.product_name}</p>
                    <p className="text-sm text-gray-500 mt-1">Purchased: {item.max_qty}</p>
                  </div>
                  
                  <div className="w-32">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Return Qty</label>
                    <input 
                      type="number" 
                      min="0" 
                      max={item.max_qty}
                      value={item.quantity}
                      onChange={e => updateItem(item.sale_item_id, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded-lg text-center font-bold"
                    />
                  </div>

                  {item.quantity > 0 && (
                    <>
                      <div className="w-40 animate-fade-in">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Condition</label>
                        <select 
                          value={item.condition}
                          onChange={e => updateItem(item.sale_item_id, 'condition', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg font-medium bg-white"
                        >
                          <option value="good">Good (Restock)</option>
                          <option value="damaged">Damaged (Defect)</option>
                        </select>
                      </div>
                      
                      <div className="flex-1 animate-fade-in">
                        <label className="block text-xs font-bold text-gray-500 mb-1">Reason</label>
                        <input 
                          type="text" 
                          placeholder="Why is it being returned?"
                          value={item.reason}
                          onChange={e => updateItem(item.sale_item_id, 'reason', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="mb-8">
              <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes</label>
              <textarea 
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any extra context for this return..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              ></textarea>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                onClick={handleSubmit}
                disabled={submitReturn.isPending}
                className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-red-700 transition shadow-lg flex items-center disabled:opacity-50"
              >
                {submitReturn.isPending ? 'Processing...' : (
                  <>
                    <CheckCircle className="mr-2" size={24} /> Submit Return
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
