import React, { useState } from 'react';
import { Search, Calendar, FileText, ChevronRight, Download, Printer } from 'lucide-react';
import { useSalesHistory } from '../../hooks/useSales';
import { Link } from 'react-router-dom';
import DocumentModal from '../../components/documents/DocumentModal';

export default function SalesHistory() {
  const [filters, setFilters] = useState({ search: '', status: '', date_from: '', date_to: '' });
  const { data: salesData, isLoading } = useSalesHistory(filters);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const sales = Array.isArray(salesData) ? salesData : salesData?.data || [];

  return (
    <div className="p-8 animate-fade-in w-full mx-auto">
      <div className="print:hidden">
        <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-3 text-primary" size={32} />
            Sales History
          </h1>
          <p className="text-gray-500 mt-2">View past transactions, reprint receipts, and track performance.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search invoice or customer..." 
              value={filters.search}
              onChange={e => setFilters({...filters, search: e.target.value})}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="date" 
              value={filters.date_from}
              onChange={e => setFilters({...filters, date_from: e.target.value})}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="date" 
              value={filters.date_to}
              onChange={e => setFilters({...filters, date_to: e.target.value})}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <select 
              value={filters.status}
              onChange={e => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Invoice No.</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Customer</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Cashier</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Total (₦)</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">Loading sales history...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-gray-500">No sales transactions found matching criteria.</td></tr>
              ) : (
                sales.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition group">
                    <td className="p-4 font-mono font-medium text-primary">{sale.invoice_number}</td>
                    <td className="p-4 text-gray-600 text-sm">{new Date(sale.created_at).toLocaleString()}</td>
                    <td className="p-4 font-medium text-gray-900">
                      {sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : <span className="text-gray-400 italic">Walk-in</span>}
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{sale.user?.name || 'System'}</td>
                    <td className="p-4 font-bold text-gray-900 text-right">{parseFloat(sale.grand_total).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                        ${sale.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          sale.status === 'refunded' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition" 
                        title="Reprint Receipt"
                      >
                        <Printer size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
      </div>
      </div>
      </div>

      <DocumentModal 
        isOpen={!!selectedSale} 
        onClose={() => setSelectedSale(null)} 
        sale={selectedSale} 
      />
    </div>
  );
}
