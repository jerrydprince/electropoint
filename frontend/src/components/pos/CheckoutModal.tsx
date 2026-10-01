import React, { useState, useEffect } from 'react';
import { X, CheckCircle, FileText, Trash2, Plus } from 'lucide-react';
import { useCheckout } from '../../hooks/usePos';
import { addTransactionToQueue } from '../../services/offlineSync';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cart: any[];
  customer: any;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  onSuccess: (saleData: any) => void;
}

interface PaymentRow {
  id: number;
  method: 'cash' | 'pos' | 'transfer' | 'credit';
  amount: string;
  reference: string;
}

export default function CheckoutModal({ isOpen, onClose, cart, customer, subtotal, discount, tax, grandTotal, onSuccess }: Props) {
  const checkout = useCheckout();
  
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPayments([{ id: Date.now(), method: 'cash', amount: grandTotal.toString(), reference: '' }]);
      setNotes('');
    }
  }, [isOpen, grandTotal]);

  if (!isOpen) return null;

  const totalTendered = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const change = Math.max(0, totalTendered - grandTotal);
  const balance = Math.max(0, grandTotal - totalTendered);

  const handleCheckout = (status: 'completed' | 'draft' = 'completed') => {
    if (status === 'completed' && totalTendered < grandTotal) {
      if (!window.confirm("Amount tendered is less than total. Record as partial payment?")) {
        return;
      }
    }
    
    // Calculate how to distribute the corporate discount across items
    const plan = customer?.corporate_plan || customer?.corporate_account?.corporate_plan;
    let corporateDiscountPerItem = (item: any) => 0;
    
    if (plan && plan.is_active) {
      if (plan.discount_type === 'percentage') {
        const pct = parseFloat(plan.discount_percentage) / 100;
        corporateDiscountPerItem = (item: any) => (item.cartQty * parseFloat(item.selling_price)) * pct;
      } else if (plan.discount_type === 'fixed') {
        // Distribute proportionally by line total
        const fixedAmt = parseFloat(plan.fixed_discount) || 0;
        corporateDiscountPerItem = (item: any) => {
           const lineTotal = item.cartQty * parseFloat(item.selling_price);
           return subtotal > 0 ? (lineTotal / subtotal) * fixedAmt : 0;
        };
      }
    }

    // Format payload to match backend expectations
    const payload = {
      customer_id: customer?.id || null,
      status: status,
      payments: status === 'draft' ? [] : payments.map(p => ({
        method: p.method,
        amount: parseFloat(p.amount) || 0,
        reference: p.reference
      })),
      notes: notes,
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.cartQty,
        discount_amount: (item.cartDiscount || 0) + corporateDiscountPerItem(item),
        serials: item.selectedSerials || []
      }))
    };

    if (!navigator.onLine) {
      const offlineTx = {
        ...payload,
        uuid: crypto.randomUUID(),
        receipt_number: `OFF-${Date.now()}`,
        subtotal,
        discount_amount: discount,
        tax_amount: tax,
        grand_total: grandTotal,
        paid_amount: totalTendered,
        payment_method: payments[0]?.method || 'cash',
        payment_status: totalTendered >= grandTotal ? 'paid' : 'partial',
        company_id: 1, // Fallback defaults
        branch_id: 1,
        user_id: 1,
        items: payload.items.map((i: any) => ({
           product_id: i.product_id,
           quantity: i.quantity,
           unit_price: cart.find(c => c.id === i.product_id)?.selling_price || 0,
           subtotal: (cart.find(c => c.id === i.product_id)?.selling_price || 0) * i.quantity
        }))
      };

      addTransactionToQueue(offlineTx).then(() => {
        toast.success("Offline transaction saved to queue!");
        onSuccess(offlineTx);
      });
      return;
    }

    checkout.mutate(payload, {
      onSuccess: (res) => {
        toast.success(status === 'draft' ? "Quotation saved successfully!" : "Transaction completed successfully!");
        onSuccess(res.data);
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error processing checkout')
    });
  };

  const addPaymentRow = () => {
    setPayments([...payments, { id: Date.now(), method: 'pos', amount: balance > 0 ? balance.toString() : '', reference: '' }]);
  };

  const removePaymentRow = (id: number) => {
    setPayments(payments.filter(p => p.id !== id));
  };

  const updatePayment = (id: number, field: keyof PaymentRow, value: string) => {
    setPayments(payments.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row h-[600px] max-h-[90vh]">
        
        {/* Left Side: Summary */}
        <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h3 className="font-bold text-gray-900">Checkout</h3>
            <button onClick={onClose}><X size={24} className="text-gray-500" /></button>
          </div>
          
          <h3 className="font-bold text-gray-900 mb-6 hidden md:block text-xl">Order Summary</h3>
          
          <div className="flex-1 overflow-y-auto mb-4 border-b border-gray-200 pb-4 pr-2">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm mb-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{item.name}</div>
                  <div className="text-gray-500">{item.cartQty} x ₦{parseFloat(item.selling_price).toLocaleString()}</div>
                </div>
                <div className="font-bold text-gray-900">
                  ₦{((item.cartQty * parseFloat(item.selling_price)) - (item.cartDiscount || 0)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Discount</span>
              <span className="text-red-500">-₦{discount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (7.5%)</span>
              <span>₦{tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-200">
              <span className="text-gray-900 font-bold text-lg">Total</span>
              <span className="text-primary font-black text-2xl">₦{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Payment */}
        <div className="w-full md:w-2/3 p-8 flex flex-col relative bg-white">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition hidden md:block">
            <X size={24} />
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Splits</h2>

          <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
            {payments.map((p, index) => (
              <div key={p.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Method</label>
                  <select 
                    value={p.method} 
                    onChange={(e) => updatePayment(p.id, 'method', e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 text-sm font-semibold"
                  >
                    <option value="cash">Cash</option>
                    <option value="pos">POS / Card</option>
                    <option value="transfer">Bank Transfer</option>
                    <option value="credit">Credit</option>
                    <option value="corporate_credit">Corporate Credit</option>
                  </select>
                </div>
                <div className="flex-[1.5]">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Amount (₦)</label>
                  <input 
                    type="number" 
                    value={p.amount} 
                    onChange={(e) => updatePayment(p.id, 'amount', e.target.value)}
                    placeholder="0.00"
                    className="w-full p-2 text-lg font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                <div className="flex-1 hidden md:block">
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Reference</label>
                  <input 
                    type="text" 
                    value={p.reference} 
                    onChange={(e) => updatePayment(p.id, 'reference', e.target.value)}
                    placeholder="Optional"
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20" 
                  />
                </div>
                {payments.length > 1 && (
                  <div className="pt-5">
                    <button onClick={() => removePaymentRow(p.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}

            <button onClick={addPaymentRow} className="flex items-center text-sm font-bold text-primary hover:text-red-700 transition">
              <Plus size={16} className="mr-1" /> Add Payment Method
            </button>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Total Tendered:</span>
              <span className="font-bold text-gray-900 text-lg">₦{totalTendered.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
              <span className="text-gray-600 font-medium">Change:</span>
              <span className="font-bold text-green-600">₦{change.toLocaleString()}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                <span className="text-red-500 font-bold">Balance Due:</span>
                <span className="font-bold text-red-600">₦{balance.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="mt-auto flex gap-3">
            <button 
              onClick={() => handleCheckout('draft')}
              disabled={checkout.isPending}
              className="flex-1 py-4 bg-gray-100 text-gray-700 text-base font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center disabled:opacity-50 border border-gray-200"
            >
              <FileText className="mr-2" size={20} />
              Quotation
            </button>
            <button 
              onClick={() => handleCheckout('completed')}
              disabled={checkout.isPending}
              className="flex-[2] py-4 bg-primary text-white text-lg font-bold rounded-xl hover:bg-red-700 transition flex items-center justify-center shadow-lg disabled:opacity-50"
            >
              {checkout.isPending ? 'Processing...' : (
                <>
                  <CheckCircle className="mr-2" size={24} />
                  Complete Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
