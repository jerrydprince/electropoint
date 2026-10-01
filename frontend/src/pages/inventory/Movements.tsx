import React, { useState } from 'react';
import { useInventoryTransactions } from '../../hooks/useInventory';
import { useWarehouses } from '../../hooks/useWarehouses';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

export default function Movements() {
  const [warehouseId, setWarehouseId] = useState('');
  const [type, setType] = useState('');
  
  const { data: movementsData, isLoading } = useInventoryTransactions({ warehouse_id: warehouseId, type });
  const { data: warehouses } = useWarehouses();

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading movements...</div>;

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Ledger</h1>
          <p className="text-gray-500 mt-1">Immutable record of all stock transactions</p>
        </div>
        <div className="flex gap-4">
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white text-sm"
          >
            <option value="">All Types</option>
            <option value="opening_stock">Opening Stock</option>
            <option value="purchase">Purchase</option>
            <option value="sale">Sale</option>
            <option value="return">Return</option>
            <option value="damage">Damage</option>
            <option value="adjustment">Adjustment</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
          </select>

          <select 
            value={warehouseId} 
            onChange={(e) => setWarehouseId(e.target.value)}
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
                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Type</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Product</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Warehouse</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Quantity</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Reference/Reason</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movementsData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No transactions found.</td>
                </tr>
              ) : (
                movementsData?.data?.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-700">
                      {new Date(t.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-gray-100 text-gray-700 font-medium capitalize">
                        {t.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{t.product?.name}</td>
                    <td className="p-4 text-sm text-gray-700">{t.warehouse?.name}</td>
                    <td className="p-4 text-right">
                      <div className={`inline-flex items-center justify-end font-bold ${t.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {t.quantity > 0 ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                        {Math.abs(t.quantity)}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{t.reference || '-'}</div>
                      {t.reason && <div className="text-xs text-gray-400 mt-0.5">{t.reason}</div>}
                    </td>
                    <td className="p-4 text-sm text-gray-700">{t.user?.name || 'System'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
