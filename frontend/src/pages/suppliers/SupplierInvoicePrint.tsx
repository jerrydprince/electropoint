import React from 'react';

export default function SupplierInvoicePrint({ invoice, onClose }: { invoice: any, onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  if (!invoice) return null;

  const po = invoice.purchase_order;
  const supplier = invoice.supplier;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 print:p-0 print:bg-white sm:p-6 animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-full overflow-y-auto print:shadow-none print:max-w-none print:w-full print:h-auto print:overflow-visible relative flex flex-col">
        
        {/* Modal Header (Hidden on Print) */}
        <div className="flex justify-between items-center p-4 border-b print:hidden sticky top-0 bg-white z-10 rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-900">Print Invoice</h2>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 font-medium">Close</button>
            <button onClick={handlePrint} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700">Print / PDF</button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 sm:p-12 print:p-8 bg-white flex-1 text-gray-900">
          
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Invoice</h1>
              <div className="mt-2 text-gray-500 font-medium">{invoice.reference}</div>
            </div>
            <div className="text-right text-sm">
              <div className="font-bold text-lg text-gray-900">Electropoint Limited</div>
              <div className="text-gray-600 mt-1">123 Tech Avenue, Business District</div>
              <div className="text-gray-600">contact@electropoint.com | +234 800 000 0000</div>
              <div className="text-gray-600 mt-2 font-medium">Branch: {po?.branch?.name || 'Main Branch'}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
            <div>
              <div className="text-gray-400 font-bold uppercase tracking-wider mb-2">Billed To</div>
              <div className="font-bold text-lg text-gray-900">{supplier?.name}</div>
              <div className="text-gray-600 mt-1">{supplier?.address}</div>
              <div className="text-gray-600">{supplier?.email}</div>
              <div className="text-gray-600">{supplier?.phone}</div>
              {supplier?.tax_number && <div className="text-gray-600 mt-1 font-medium">VAT: {supplier?.tax_number}</div>}
            </div>
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4 ml-auto w-64 text-left">
                <div className="text-gray-500 font-medium">Invoice Date:</div>
                <div className="font-medium text-gray-900 text-right">{new Date(invoice.created_at).toLocaleDateString()}</div>
                
                <div className="text-gray-500 font-medium">Due Date:</div>
                <div className="font-medium text-gray-900 text-right">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon Receipt'}</div>
                
                <div className="text-gray-500 font-medium">PO Number:</div>
                <div className="font-medium text-gray-900 text-right">{po?.reference}</div>
                
                <div className="text-gray-500 font-medium">Status:</div>
                <div className="font-bold uppercase text-right text-gray-900">{invoice.status.replace('_', ' ')}</div>
              </div>
            </div>
          </div>

          <table className="w-full text-left mb-10">
            <thead className="border-y-2 border-gray-900">
              <tr>
                <th className="py-3 px-2 font-bold text-gray-900 uppercase text-xs tracking-wider">Item / Description</th>
                <th className="py-3 px-2 font-bold text-gray-900 uppercase text-xs tracking-wider text-center">Qty</th>
                <th className="py-3 px-2 font-bold text-gray-900 uppercase text-xs tracking-wider text-right">Unit Price</th>
                <th className="py-3 px-2 font-bold text-gray-900 uppercase text-xs tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {po?.items?.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-4 px-2 font-medium text-gray-900">
                    {item.product?.name}
                  </td>
                  <td className="py-4 px-2 text-center text-gray-700">{item.quantity}</td>
                  <td className="py-4 px-2 text-right text-gray-700">₦{parseFloat(item.unit_cost).toLocaleString()}</td>
                  <td className="py-4 px-2 text-right font-medium text-gray-900">₦{(item.quantity * item.unit_cost).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mb-12">
            <div className="w-72 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Subtotal:</span>
                <span className="text-gray-900 font-medium">₦{parseFloat(po?.total_amount).toLocaleString()}</span>
              </div>
              {parseFloat(po?.discount_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Discount:</span>
                  <span className="text-gray-900 font-medium">-₦{parseFloat(po?.discount_amount).toLocaleString()}</span>
                </div>
              )}
              {parseFloat(po?.tax_amount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 font-medium">Tax:</span>
                  <span className="text-gray-900 font-medium">₦{parseFloat(po?.tax_amount).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between border-t-2 border-gray-900 pt-3">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-black text-gray-900">₦{parseFloat(invoice.total_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-green-700 pt-1">
                <span className="font-medium">Amount Paid:</span>
                <span className="font-bold">₦{parseFloat(invoice.paid_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-red-700 pt-1">
                <span className="font-medium">Balance Due:</span>
                <span className="font-bold">₦{(invoice.total_amount - invoice.paid_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-12 grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-xs">Payment Information</div>
              <div className="text-gray-600 whitespace-pre-wrap">{supplier?.bank_details || 'Please contact us for payment instructions.'}</div>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-xs">Notes</div>
              <div className="text-gray-600">{invoice.notes || po?.notes || 'Thank you for your business!'}</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
