import React, { useState, useEffect } from 'react';
import { Printer, FileText } from 'lucide-react';

interface Props {
  sale: any;
  autoPrint?: boolean;
}

export default function DocumentViewer({ sale, autoPrint = false }: Props) {
  const [format, setFormat] = useState<'thermal' | 'a4'>('thermal');

  if (!sale) return null;

  useEffect(() => {
    if (autoPrint && sale) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [autoPrint, sale]);


  const isDraft = sale.status === 'draft';
  const documentType = isDraft ? 'QUOTATION / PROFORMA' : 'SALES INVOICE / RECEIPT';
  
  const handlePrint = () => {
    window.print();
  };

  const getPaymentStatusColor = () => {
    if (sale.payment_status === 'paid') return 'text-green-600 border-green-600';
    if (sale.payment_status === 'partial') return 'text-yellow-600 border-yellow-600';
    return 'text-red-600 border-red-600';
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      
      {/* Controls (Hidden when printing) */}
      <div className="bg-white p-4 border-b flex justify-between items-center print:hidden shadow-sm z-10 shrink-0">
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setFormat('thermal')}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${format === 'thermal' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            Thermal Receipt
          </button>
          <button 
            onClick={() => setFormat('a4')}
            className={`px-4 py-1.5 text-sm font-bold rounded-md transition ${format === 'a4' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
          >
            A4 Invoice
          </button>
        </div>

        <button 
          onClick={handlePrint} 
          className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-red-700 flex items-center shadow-md transition"
        >
          <Printer size={16} className="mr-2" /> Print Document
        </button>
      </div>

      {/* Document Area */}
      <div id="print-area" className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start print:overflow-visible print:p-0 print:block">
        
        {format === 'thermal' && (
          <div className="flex flex-col gap-4 print:block w-full items-center">
            {[1, 2].map(copyNum => (
              <div key={copyNum} className={`bg-white shadow-lg p-6 w-[320px] shrink-0 text-xs font-mono text-black print:shadow-none print:w-[80mm] print:p-0 ${copyNum === 2 ? 'hidden print:block border-t-2 border-dashed border-gray-400 mt-8 pt-8' : ''}`}>
                {copyNum === 2 && <div className="text-center font-bold mb-4 text-sm tracking-widest">*** MERCHANT COPY ***</div>}
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold uppercase tracking-widest">ELECTROPOINT</h2>
              <p>123 Electronics Avenue</p>
              <p>Lagos, Nigeria</p>
              <p>Tel: +234 800 000 0000</p>
              <p className="mt-2 text-[10px]">VAT Reg No: 123456789</p>
              <h3 className="font-bold text-sm mt-3 border-y border-black py-1">{documentType}</h3>
            </div>

            <div className="mb-4">
              <div className="flex justify-between"><span>Date:</span> <span>{new Date(sale.created_at).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Inv #:</span> <span>{sale.invoice_number}</span></div>
              <div className="flex justify-between"><span>Cashier:</span> <span>{sale.user?.name || 'System'}</span></div>
              <div className="flex justify-between"><span>Customer:</span> <span>{sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : 'Walk-in'}</span></div>
            </div>

            <div className="border-t border-dashed border-black pt-2 mb-2">
              <div className="flex justify-between font-bold mb-1 border-b border-dashed border-black pb-1">
                <span className="w-1/2">Item</span>
                <span className="w-1/4 text-center">Qty</span>
                <span className="w-1/4 text-right">Total</span>
              </div>
              {sale.items?.map((item: any) => (
                <div key={item.id} className="mb-2">
                  <div className="flex justify-between">
                    <span className="w-1/2 pr-1 truncate">{item.product?.name}</span>
                    <span className="w-1/4 text-center">{item.quantity}</span>
                    <span className="w-1/4 text-right">{parseFloat(item.total).toLocaleString()}</span>
                  </div>
                  {item.discount_amount > 0 && (
                    <div className="text-[10px] text-right text-gray-700">Disc: -{parseFloat(item.discount_amount).toLocaleString()}</div>
                  )}
                  {item.serials && item.serials.length > 0 && (
                    <div className="text-[9px] text-gray-700 break-words mt-0.5">SN: {item.serials.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-black pt-2 mb-4 space-y-1">
              <div className="flex justify-between"><span>Subtotal:</span> <span>{parseFloat(sale.subtotal).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Discount:</span> <span>-{parseFloat(sale.discount_amount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span>Tax (7.5%):</span> <span>{parseFloat(sale.tax_amount).toLocaleString()}</span></div>
              <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-dashed border-black">
                <span>TOTAL:</span> <span>₦{parseFloat(sale.grand_total).toLocaleString()}</span>
              </div>
            </div>

            {!isDraft && (
              <div className="border-t border-dashed border-black pt-2 mb-4 space-y-1">
                <h4 className="font-bold text-center mb-1">PAYMENTS</h4>
                {sale.payments?.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between text-[11px]">
                    <span className="uppercase">{payment.payment_method} {payment.reference_number ? `(${payment.reference_number})` : ''}:</span> 
                    <span>{parseFloat(payment.amount).toLocaleString()}</span>
                  </div>
                ))}
                
                {(() => {
                  const totalPaid = sale.payments?.reduce((s: number, p: any) => s + parseFloat(p.amount), 0) || 0;
                  const balance = Math.max(0, parseFloat(sale.grand_total) - totalPaid);
                  const change = Math.max(0, totalPaid - parseFloat(sale.grand_total));
                  return (
                    <div className="mt-2 pt-1 border-t border-dashed border-black font-bold">
                      {change > 0 && <div className="flex justify-between"><span>CHANGE:</span> <span>{change.toLocaleString()}</span></div>}
                      {balance > 0 && <div className="flex justify-between"><span>BALANCE DUE:</span> <span>{balance.toLocaleString()}</span></div>}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="text-center mt-6">
              <p className="font-bold">Thank you for your business!</p>
              <p className="text-[9px] mt-2 text-justify">Goods bought in good condition cannot be returned. Warranty valid only with this original receipt and unbroken warranty seals. Warranty does not cover physical damage.</p>
              <div className="mt-4 flex justify-center">
                 <div className="font-mono tracking-[0.2em] text-sm bg-black text-white px-2 py-1">* {sale.invoice_number} *</div>
              </div>
            </div>
          </div>
            ))}
          </div>
        )}

        {format === 'a4' && (
          <div className="bg-white shadow-xl w-full max-w-[800px] p-12 shrink-0 print:shadow-none print:w-[210mm] print:h-[297mm] print:p-8">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">ELECTROPOINT</h1>
                <div className="mt-2 text-gray-600 text-sm">
                  <p>123 Electronics Avenue</p>
                  <p>Victoria Island, Lagos, Nigeria</p>
                  <p>Phone: +234 800 000 0000</p>
                  <p>Email: sales@electropoint.com</p>
                  <p>VAT Reg: 123456789</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-light text-gray-400 uppercase tracking-widest">{isDraft ? 'QUOTATION' : 'INVOICE'}</h2>
                <div className="mt-4 flex flex-col items-end">
                  <div className={`px-4 py-1 border-2 rounded uppercase font-bold tracking-widest ${getPaymentStatusColor()}`}>
                    {isDraft ? 'DRAFT' : sale.payment_status}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To</h3>
                {sale.customer ? (
                  <div className="text-gray-900">
                    <p className="font-bold text-lg">{sale.customer.first_name} {sale.customer.last_name}</p>
                    {sale.customer.company && <p>{sale.customer.company}</p>}
                    {sale.customer.phone && <p>{sale.customer.phone}</p>}
                    {sale.customer.email && <p>{sale.customer.email}</p>}
                  </div>
                ) : (
                  <p className="text-gray-900 font-bold text-lg">Walk-in Customer</p>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Invoice Number</p>
                  <p className="font-mono font-bold text-gray-900 mt-1">{sale.invoice_number}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Date</p>
                  <p className="font-medium text-gray-900 mt-1">{new Date(sale.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Cashier</p>
                  <p className="font-medium text-gray-900 mt-1">{sale.user?.name || 'System'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase">Total Amount</p>
                  <p className="font-bold text-primary mt-1">₦{parseFloat(sale.grand_total).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="py-3 text-left text-sm font-bold text-gray-900">Item Description</th>
                  <th className="py-3 text-center text-sm font-bold text-gray-900 w-24">Qty</th>
                  <th className="py-3 text-right text-sm font-bold text-gray-900 w-32">Unit Price</th>
                  <th className="py-3 text-right text-sm font-bold text-gray-900 w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.items?.map((item: any) => (
                  <tr key={item.id}>
                    <td className="py-4">
                      <div className="font-bold text-gray-900">{item.product?.name}</div>
                      {item.product?.sku && <div className="text-xs text-gray-500 font-mono mt-0.5">SKU: {item.product.sku}</div>}
                      {item.serials && item.serials.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1 bg-gray-50 inline-block px-2 py-1 rounded">SN: {item.serials.join(', ')}</div>
                      )}
                    </td>
                    <td className="py-4 text-center font-medium">{item.quantity}</td>
                    <td className="py-4 text-right font-medium">
                      <div>{parseFloat(item.unit_price).toLocaleString()}</div>
                      {item.discount_amount > 0 && <div className="text-xs text-red-500">Disc: -{parseFloat(item.discount_amount).toLocaleString()}</div>}
                    </td>
                    <td className="py-4 text-right font-bold text-gray-900">{parseFloat(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end mb-12">
              <div className="w-72 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₦{parseFloat(sale.subtotal).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Discount</span>
                  <span>-₦{parseFloat(sale.discount_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (7.5%)</span>
                  <span>₦{parseFloat(sale.tax_amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-xl text-gray-900 pt-3 border-t-2 border-gray-900">
                  <span>Grand Total</span>
                  <span>₦{parseFloat(sale.grand_total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {!isDraft && sale.payments?.length > 0 && (
              <div className="mb-12">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2">Payment History</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {sale.payments.map((p: any) => (
                      <div key={p.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="uppercase font-medium text-gray-700">{p.payment_method} {p.reference_number ? `(${p.reference_number})` : ''}</span>
                        <span className="font-bold">₦{parseFloat(p.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const totalPaid = sale.payments?.reduce((s: number, p: any) => s + parseFloat(p.amount), 0) || 0;
                    const balance = Math.max(0, parseFloat(sale.grand_total) - totalPaid);
                    return balance > 0 ? (
                      <div className="bg-red-50 p-4 rounded-xl flex items-center justify-between border border-red-100">
                        <span className="font-bold text-red-600 uppercase">Balance Due</span>
                        <span className="font-black text-xl text-red-700">₦{balance.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="bg-green-50 p-4 rounded-xl flex items-center justify-between border border-green-100">
                        <span className="font-bold text-green-600 uppercase">Balance Due</span>
                        <span className="font-black text-xl text-green-700">₦0.00</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-8 mt-12 text-sm text-gray-500">
              <h4 className="font-bold text-gray-900 mb-2">Terms & Conditions</h4>
              <p className="mb-1">1. Goods bought in good condition cannot be returned.</p>
              <p className="mb-1">2. Warranty is valid only with this original invoice and unbroken warranty seals.</p>
              <p>3. Warranty does not cover physical damage, power surges, or liquid damage.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
