import React, { useState } from 'react';
import { useProductSerials } from '../../hooks/useInventory';
import { useWarehouses } from '../../hooks/useWarehouses';
import { Hash, Search } from 'lucide-react';

export default function Serials() {
  const [warehouseId, setWarehouseId] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  
  const { data: serialsData, isLoading } = useProductSerials({ warehouse_id: warehouseId, status, search, page });
  const { data: warehouses } = useWarehouses();

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading serials...</div>;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Serial Numbers</h1>
          <p className="text-gray-500 mt-1">Track individual items globally</p>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search serial..." 
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <select 
            value={status} 
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
            <option value="returned">Returned</option>
            <option value="damaged">Damaged</option>
            <option value="transferred">Transferred</option>
          </select>

          <select 
            value={warehouseId} 
            onChange={(e) => { setWarehouseId(e.target.value); setPage(1); }}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
          >
            <option value="">All Warehouses</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Serial Number</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Product</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Location</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Last Transaction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {serialsData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    <Hash className="mx-auto text-gray-300 mb-3" size={32} />
                    No serial numbers found.
                  </td>
                </tr>
              ) : (
                serialsData?.data?.map((serial: any) => (
                  <tr key={serial.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900 font-mono flex items-center">
                        <Hash size={14} className="text-gray-400 mr-1" />
                        {serial.serial_number}
                      </div>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{serial.product?.name}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                        serial.status === 'available' ? 'bg-green-100 text-green-700' :
                        serial.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                        serial.status === 'damaged' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {serial.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700">{serial.warehouse?.name || '-'}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {serial.transaction ? (
                        <>
                          <div className="font-medium text-gray-700 capitalize">{serial.transaction.type.replace('_', ' ')}</div>
                          <div className="text-xs">{new Date(serial.transaction.created_at).toLocaleDateString()}</div>
                        </>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {serialsData && serialsData.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing page {serialsData.current_page} of {serialsData.last_page} ({serialsData.total} total serials)
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={serialsData.current_page === 1}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Previous
              </button>
              <button 
                onClick={() => setPage(p => Math.min(serialsData.last_page, p + 1))}
                disabled={serialsData.current_page === serialsData.last_page}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
