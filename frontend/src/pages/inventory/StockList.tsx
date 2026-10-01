import React, { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useAuth } from '../../contexts/AuthContext';
import { Package, AlertCircle, Sliders, FileText } from 'lucide-react';
import { useWarehouses } from '../../hooks/useWarehouses';
import AdjustmentModal from '../../components/inventory/AdjustmentModal';
import StockCardModal from '../../components/inventory/StockCardModal';

export default function StockList() {
  const [warehouseId, setWarehouseId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState('name_asc');
  const [search, setSearch] = useState('');
  const { hasPermission } = useAuth();
  
  const { data: inventoryData, isLoading } = useInventory({ warehouse_id: warehouseId });
  const { data: warehouses } = useWarehouses();

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading stock...</div>;

  let filteredInventory = inventoryData?.data?.filter((inv: any) => 
    inv.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    inv.product?.sku?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (sortBy === 'name_asc') {
    filteredInventory = filteredInventory.sort((a: any, b: any) => a.product?.name?.localeCompare(b.product?.name));
  } else if (sortBy === 'qty_desc') {
    filteredInventory = filteredInventory.sort((a: any, b: any) => b.quantity - a.quantity);
  } else if (sortBy === 'qty_asc') {
    filteredInventory = filteredInventory.sort((a: any, b: any) => a.quantity - b.quantity);
  }

  return (
    <div className="p-6 w-full mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Stock List</h1>
          <p className="text-gray-500 mt-1">Detailed inventory levels across all locations</p>
        </div>
        <div className="flex gap-4 items-center">
          {hasPermission('inventory.adjust_stock') && (
            <button 
              onClick={() => {
                setSelectedProduct(undefined);
                setSelectedWarehouse(undefined);
                setModalOpen(true);
              }}
              className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center shadow-sm whitespace-nowrap"
            >
              <Sliders size={18} className="mr-2" />
              Adjust Stock
            </button>
          )}
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          />
          <select 
            value={warehouseId} 
            onChange={(e) => setWarehouseId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="">All Warehouses</option>
            {warehouses?.map((w: any) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white"
          >
            <option value="name_asc">Sort by: Name (A-Z)</option>
            <option value="qty_desc">Sort by: Highest Stock</option>
            <option value="qty_asc">Sort by: Lowest Stock</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Product</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Warehouse</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Quantity</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Reserved</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Damaged</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    <Package className="mx-auto text-gray-300 mb-3" size={32} />
                    No stock found. Adjust stock to add inventory.
                  </td>
                </tr>
              ) : (
                filteredInventory.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{inv.product?.name}</div>
                      <div className="text-xs text-gray-500 mt-1">{inv.product?.sku}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">{inv.warehouse?.name}</td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                        {inv.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600 text-center">{inv.reserved_quantity}</td>
                    <td className="p-4 text-sm text-red-600 text-center">{inv.damaged_quantity}</td>
                    <td className="p-4">
                      {inv.quantity <= 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertCircle size={12} className="mr-1" /> Out of Stock
                        </span>
                      ) : inv.quantity <= inv.product?.reorder_level ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setSelectedProduct(inv.product_id?.toString());
                            setSelectedWarehouse(inv.warehouse_id?.toString());
                            setCardModalOpen(true);
                          }}
                          className="inline-flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                        >
                          <FileText size={14} className="mr-1" />
                          Card
                        </button>
                        {hasPermission('inventory.adjust_stock') && (
                          <button 
                            onClick={() => {
                              setSelectedProduct(inv.product_id?.toString());
                              setSelectedWarehouse(inv.warehouse_id?.toString());
                              setModalOpen(true);
                            }}
                            className="inline-flex items-center text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition"
                          >
                            <Sliders size={14} className="mr-1" />
                            Adjust
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AdjustmentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        defaultProductId={selectedProduct}
        defaultWarehouseId={selectedWarehouse}
      />
      <StockCardModal 
        isOpen={cardModalOpen} 
        onClose={() => setCardModalOpen(false)} 
        productId={selectedProduct}
        warehouseId={selectedWarehouse}
      />
    </div>
  );
}
