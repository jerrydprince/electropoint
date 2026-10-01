import React, { useState } from 'react';
import { useSupplierInvoices, useCreateSupplierInvoice, useSupplierPayments, useCreateSupplierPayment, useSupplierStatement } from '../../hooks/useSupplierFinance';
import { FileText, CreditCard, DollarSign, Plus, Check, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import SupplierInvoicePrint from './SupplierInvoicePrint';

export function SupplierInvoices({ supplierId, pos }: { supplierId: string, pos: any[] }) {
  const { data: invoiceData, isLoading } = useSupplierInvoices({ supplier_id: supplierId });
  const createInvoice = useCreateSupplierInvoice();
  
  const [showForm, setShowForm] = useState(false);
  const [printInvoice, setPrintInvoice] = useState<any>(null);
  const [formData, setFormData] = useState({ supplier_id: supplierId, purchase_order_id: '', due_date: '', notes: '' });

  const invoices = Array.isArray(invoiceData) ? invoiceData : invoiceData?.data || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice.mutate(formData, {
      onSuccess: () => {
        toast.success("Invoice generated successfully");
        setShowForm(false);
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error generating invoice')
    });
  };

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="font-bold text-gray-900 flex items-center"><FileText className="mr-2" size={18} /> Invoices</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 flex items-center">
            <Plus size={16} className="mr-1" /> Record Invoice
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Purchase Order *</label>
              <select required value={formData.purchase_order_id} onChange={e => setFormData({...formData, purchase_order_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="">-- Select PO --</option>
                {pos?.map((po: any) => <option key={po.id} value={po.id}>{po.reference} - ₦{parseFloat(po.total_amount).toLocaleString()}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createInvoice.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-700">{createInvoice.isPending ? 'Saving...' : 'Save Invoice'}</button>
          </div>
        </form>
      )}

      <table className="w-full text-left bg-white rounded-xl shadow-sm overflow-hidden border">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 font-semibold text-gray-600 text-sm">Ref</th>
            <th className="p-4 font-semibold text-gray-600 text-sm">PO Ref</th>
            <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
            <th className="p-4 font-semibold text-gray-600 text-sm text-right">Total</th>
            <th className="p-4 font-semibold text-gray-600 text-sm text-right">Paid</th>
            <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
            <th className="p-4 font-semibold text-gray-600 text-sm text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoices.length === 0 ? (
            <tr><td colSpan={6} className="p-8 text-center text-gray-500">No invoices recorded yet.</td></tr>
          ) : (
            invoices.map((inv: any) => (
              <tr key={inv.id}>
                <td className="p-4 font-medium text-gray-900">{inv.reference}</td>
                <td className="p-4 text-blue-600 text-sm">{inv.purchase_order?.reference}</td>
                <td className="p-4 text-gray-600 text-sm">{new Date(inv.created_at).toLocaleDateString()}</td>
                <td className="p-4 font-bold text-gray-900 text-right">₦{parseFloat(inv.total_amount).toLocaleString()}</td>
                <td className="p-4 font-medium text-green-600 text-right">₦{parseFloat(inv.paid_amount).toLocaleString()}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : inv.status === 'partially_paid' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {inv.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => setPrintInvoice(inv)} className="p-2 text-gray-500 hover:text-primary hover:bg-red-50 rounded-lg transition" title="Print Invoice">
                    <Printer size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {printInvoice && (
        <SupplierInvoicePrint invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
      )}
    </div>
  );
}

export function SupplierPayments({ supplierId }: { supplierId: string }) {
  const { data: paymentData, isLoading } = useSupplierPayments({ supplier_id: supplierId });
  const { data: invoiceData } = useSupplierInvoices({ supplier_id: supplierId });
  const createPayment = useCreateSupplierPayment();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ supplier_id: supplierId, supplier_invoice_id: '', amount: '', payment_method: 'bank_transfer', reference: '', payment_date: new Date().toISOString().split('T')[0], notes: '' });

  const payments = Array.isArray(paymentData) ? paymentData : paymentData?.data || [];
  const invoices = Array.isArray(invoiceData) ? invoiceData : invoiceData?.data || [];
  const unpaidInvoices = invoices.filter((i: any) => i.status !== 'paid');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPayment.mutate(formData, {
      onSuccess: () => {
        toast.success("Payment recorded successfully");
        setShowForm(false);
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error recording payment')
    });
  };

  if (isLoading) return <div className="py-8 text-center text-gray-500">Loading payments...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="font-bold text-gray-900 flex items-center"><CreditCard className="mr-2" size={18} /> Payments</h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center">
            <Plus size={16} className="mr-1" /> Record Payment
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-green-50 p-6 rounded-xl border border-green-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allocate to Invoice (Optional)</label>
              <select value={formData.supplier_invoice_id} onChange={e => setFormData({...formData, supplier_invoice_id: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="">-- No Allocation (Advance Payment) --</option>
                {unpaidInvoices.map((inv: any) => <option key={inv.id} value={inv.id}>{inv.reference} (Bal: ₦{(inv.total_amount - inv.paid_amount).toLocaleString()})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦) *</label>
              <input type="number" required min="0.01" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method *</label>
              <select required value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference (Tx ID/Cheque No)</label>
              <input type="text" value={formData.reference} onChange={e => setFormData({...formData, reference: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date *</label>
              <input type="date" required value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={createPayment.isPending} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">{createPayment.isPending ? 'Saving...' : 'Save Payment'}</button>
          </div>
        </form>
      )}

      <table className="w-full text-left bg-white rounded-xl shadow-sm overflow-hidden border">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
            <th className="p-4 font-semibold text-gray-600 text-sm">Method</th>
            <th className="p-4 font-semibold text-gray-600 text-sm">Ref</th>
            <th className="p-4 font-semibold text-gray-600 text-sm">Allocated Invoice</th>
            <th className="p-4 font-semibold text-gray-600 text-sm text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {payments.length === 0 ? (
            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payments recorded yet.</td></tr>
          ) : (
            payments.map((pay: any) => (
              <tr key={pay.id}>
                <td className="p-4 text-gray-900 font-medium">{new Date(pay.payment_date).toLocaleDateString()}</td>
                <td className="p-4 text-gray-600 text-sm capitalize">{pay.payment_method.replace('_', ' ')}</td>
                <td className="p-4 text-gray-600 text-sm">{pay.reference || '-'}</td>
                <td className="p-4 text-blue-600 text-sm">{pay.invoice?.reference || 'Unallocated'}</td>
                <td className="p-4 font-bold text-green-600 text-right">₦{parseFloat(pay.amount).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function SupplierStatement({ supplierId }: { supplierId: string }) {
  const { data: statement, isLoading } = useSupplierStatement(supplierId);

  if (isLoading || !statement) return <div className="py-8 text-center text-gray-500">Loading statement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h3 className="font-bold text-gray-900 flex items-center"><DollarSign className="mr-2" size={18} /> Financial Statement</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <div className="text-sm font-medium text-blue-800 mb-1">Total Invoiced</div>
          <div className="text-2xl font-bold text-blue-900">₦{parseFloat(statement.total_invoiced).toLocaleString()}</div>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-2xl p-6">
          <div className="text-sm font-medium text-green-800 mb-1">Total Paid</div>
          <div className="text-2xl font-bold text-green-900">₦{parseFloat(statement.total_paid).toLocaleString()}</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6">
          <div className="text-sm font-medium text-yellow-800 mb-1">Unallocated Payments</div>
          <div className="text-2xl font-bold text-yellow-900">₦{parseFloat(statement.unallocated_payments).toLocaleString()}</div>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
          <div className="text-sm font-medium text-red-800 mb-1">Outstanding Balance</div>
          <div className="text-3xl font-black text-red-700">₦{parseFloat(statement.outstanding_balance).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
