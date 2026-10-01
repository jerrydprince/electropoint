import React from 'react';
import { X, Printer } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
}

export default function ReceiptModal({ isOpen, onClose, sale }: Props) {
  if (!isOpen || !sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm print:bg-transparent print:backdrop-blur-none">
      
      {/* On-Screen Container (hidden during print) */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh] print:hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900">Receipt</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto bg-gray-100 flex justify-center">
           {/* Preview of the receipt */}
           <div className="bg-white p-6 shadow-sm w-[300px] text-xs font-mono text-black">
              <ReceiptContent sale={sale} />
           </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50">Close</button>
          <button onClick={handlePrint} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-red-700 flex items-center">
            <Printer size={16} className="mr-2" /> Print Receipt
          </button>
        </div>
      </div>

      {/* Print-Only Container (visible only during print) */}
      <div className="hidden print:block w-[300px] text-xs font-mono text-black bg-white">
        <ReceiptContent sale={sale} />
      </div>
    </div>
  );
}

function ReceiptContent({ sale }: { sale: any }) {
  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold">ELECTROPOINT</h2>
        <p>123 Electronics Avenue</p>
        <p>Tel: +234 800 000 0000</p>
        <p className="mt-2 text-[10px]">VAT No: 123456789</p>
      </div>

      <div className="border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between"><span>Date:</span> <span>{new Date(sale.created_at).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Invoice:</span> <span>{sale.invoice_number}</span></div>
        <div className="flex justify-between"><span>Cashier:</span> <span>{sale.user?.name || 'System'}</span></div>
        <div className="flex justify-between"><span>Customer:</span> <span>{sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : 'Walk-in'}</span></div>
      </div>

      <div className="border-b border-dashed border-black pb-2 mb-2">
        <div className="flex justify-between font-bold mb-1">
          <span className="w-1/2">Item</span>
          <span className="w-1/4 text-center">Qty</span>
          <span className="w-1/4 text-right">Total</span>
        </div>
        {sale.items?.map((item: any) => (
          <div key={item.id} className="mb-2">
            <div className="flex justify-between">
              <span className="w-1/2 truncate pr-1">{item.product?.name}</span>
              <span className="w-1/4 text-center">{item.quantity}</span>
              <span className="w-1/4 text-right">{parseFloat(item.total).toLocaleString()}</span>
            </div>
            {item.discount_amount > 0 && (
              <div className="text-[10px] text-right">Disc: -{parseFloat(item.discount_amount).toLocaleString()}</div>
            )}
            {item.serials && item.serials.length > 0 && (
              <div className="text-[9px] text-gray-600">SN: {item.serials.join(', ')}</div>
            )}
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
        <div className="flex justify-between"><span>Subtotal:</span> <span>{parseFloat(sale.subtotal).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Discount:</span> <span>-{parseFloat(sale.discount_amount).toLocaleString()}</span></div>
        <div className="flex justify-between"><span>Tax (7.5%):</span> <span>{parseFloat(sale.tax_amount).toLocaleString()}</span></div>
        <div className="flex justify-between font-bold text-sm mt-1"><span>TOTAL:</span> <span>{parseFloat(sale.grand_total).toLocaleString()}</span></div>
      </div>

      <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
        {sale.payments?.map((payment: any, idx: number) => (
          <div key={idx} className="flex justify-between">
            <span className="uppercase">{payment.payment_method}:</span> 
            <span>{parseFloat(payment.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div className="text-center mt-4">
        <p className="font-bold">Thank you for your business!</p>
        <p className="text-[10px] mt-1">Goods bought in good condition cannot be returned.</p>
        
        {/* Simple Barcode Simulation using CSS */}
        <div className="mt-4 flex justify-center">
           <div className="font-mono tracking-[0.3em] text-lg bg-black text-white px-2">* {sale.invoice_number} *</div>
        </div>
      </div>
    </div>
  );
}
