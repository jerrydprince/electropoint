import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '../../hooks/useProducts';
import { useInventory, useProductSerials } from '../../hooks/useInventory';
import { useSalesHistory } from '../../hooks/useSales';
import { usePurchaseOrders } from '../../hooks/useProcurement';
import { Package, Edit, ArrowLeft, TrendingUp, History, Hash, ShoppingCart, Truck, ShieldCheck, DollarSign } from 'lucide-react';
import ProductForm from './ProductForm';

export default function ProductDetails() {
  const { id } = useParams();
  const { data: product, isLoading } = useProduct(id);
  
  const [activeTab, setActiveTab] = useState('price_history');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: inventoryData, isLoading: invLoading } = useInventory({ product_id: id });
  const { data: serialsData, isLoading: serialsLoading } = useProductSerials({ product_id: id });
  const { data: salesData, isLoading: salesLoading } = useSalesHistory({ product_id: id });
  const { data: purchasesData, isLoading: purchasesLoading } = usePurchaseOrders({ product_id: id });

  if (isLoading) return <div className="p-6 text-center">Loading product...</div>;
  if (!product) return <div className="p-6 text-center text-red-500">Product not found.</div>;

  const tabs = [
    { id: 'stock', name: 'Current Stock', icon: Package },
    { id: 'price_history', name: 'Price History', icon: DollarSign },
    { id: 'serial', name: 'Serial Numbers', icon: Hash },
    { id: 'sales', name: 'Sales History', icon: ShoppingCart },
    { id: 'purchases', name: 'Purchase History', icon: Truck },
  ];

  return (
    <div className="p-6 w-full mx-auto animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link to="/products" className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                {product.status}
              </span>
              <span className="text-gray-500 text-sm font-mono">{product.sku}</span>
            </div>
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm flex items-center">
          <Edit size={18} className="mr-2" />
          Edit Product
        </button>
      </div>

      {/* Top Meta Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
            {product.image ? (
              <img src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <Package className="text-gray-400" size={32} />
            )}
          </div>
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Selling Price</h3>
            <div className="text-2xl font-bold text-gray-900">₦{Number(product.selling_price).toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">Cost: ₦{Number(product.cost_price).toFixed(2)}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Classification</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Brand:</span> <span className="font-medium">{product.brand?.name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Category:</span> <span className="font-medium">{product.category?.name || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Unit:</span> <span className="font-medium">{product.unit?.name || '-'}</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Inventory Rules</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Min Stock:</span> <span className="font-medium">{product.min_stock}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Max Stock:</span> <span className="font-medium">{product.max_stock || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Reorder Level:</span> <span className="font-medium text-orange-600">{product.reorder_level}</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Warranty:</span> <span className="font-medium">{product.warranty_period ? `${product.warranty_period} Months` : 'None'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-medium">{product.warranty_type || '-'}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Serial Tracking:</span> 
              <span className={`font-medium ${product.serial_tracking ? 'text-green-600' : 'text-gray-900'}`}>{product.serial_tracking ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 bg-gray-50/50">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon size={16} className="mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-0">
          {activeTab === 'price_history' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Price Type</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Old Price</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">New Price</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Changed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {product.price_histories?.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No price history available.</td></tr>
                  ) : (
                    product.price_histories?.map((history: any) => (
                      <tr key={history.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-700">
                          {new Date(history.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="p-4 text-sm font-medium text-gray-900 capitalize">{history.price_type.replace('_', ' ')}</td>
                        <td className="p-4 text-sm text-gray-500 line-through">₦{Number(history.old_price).toFixed(2)}</td>
                        <td className="p-4 text-sm font-bold text-gray-900">₦{Number(history.new_price).toFixed(2)}</td>
                        <td className="p-4 text-sm text-gray-600">{history.user?.name || 'System'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Warehouse</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Branch</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Quantity</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Damaged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading stock...</td></tr>
                  ) : inventoryData?.data?.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No stock found for this product.</td></tr>
                  ) : (
                    inventoryData?.data?.map((inv: any) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm font-medium text-gray-900">{inv.warehouse?.name}</td>
                        <td className="p-4 text-sm text-gray-600">{inv.warehouse?.branch?.name || '-'}</td>
                        <td className="p-4 text-sm font-bold text-gray-900">{inv.quantity}</td>
                        <td className="p-4 text-sm text-red-600">{inv.damaged_quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'serial' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Serial Number</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Warehouse</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Last Transaction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {serialsLoading ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">Loading serials...</td></tr>
                  ) : serialsData?.data?.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-gray-500">No serial numbers found.</td></tr>
                  ) : (
                    serialsData?.data?.map((serial: any) => (
                      <tr key={serial.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm font-mono font-medium text-gray-900">{serial.serial_number}</td>
                        <td className="p-4 text-sm">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${
                            serial.status === 'in_stock' ? 'bg-green-100 text-green-700' :
                            serial.status === 'sold' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {serial.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{serial.warehouse?.name || '-'}</td>
                        <td className="p-4 text-sm text-gray-500">{serial.transaction?.reference || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Invoice #</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Customer</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Qty Sold</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesLoading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading sales history...</td></tr>
                  ) : salesData?.data?.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No sales history found for this product.</td></tr>
                  ) : (
                    salesData?.data?.map((sale: any) => {
                      const item = sale.items?.find((i: any) => String(i.product_id) === String(id));
                      return (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="p-4 text-sm text-gray-700">{new Date(sale.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-sm font-mono text-gray-900">{sale.invoice_number}</td>
                          <td className="p-4 text-sm text-gray-900">{sale.customer ? `${sale.customer.first_name} ${sale.customer.last_name}` : 'Walk-in'}</td>
                          <td className="p-4 text-sm font-bold text-gray-900">{item?.quantity || '-'}</td>
                          <td className="p-4 text-sm">
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-700 uppercase">
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">PO #</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Supplier</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Ordered Qty</th>
                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {purchasesLoading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading purchase history...</td></tr>
                  ) : purchasesData?.data?.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">No purchase history found for this product.</td></tr>
                  ) : (
                    purchasesData?.data?.map((po: any) => {
                      const item = po.items?.find((i: any) => String(i.product_id) === String(id));
                      return (
                        <tr key={po.id} className="hover:bg-gray-50">
                          <td className="p-4 text-sm text-gray-700">{new Date(po.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-sm font-mono text-gray-900">{po.reference}</td>
                          <td className="p-4 text-sm text-gray-900">{po.supplier?.company_name || po.supplier?.contact_name}</td>
                          <td className="p-4 text-sm font-bold text-gray-900">{item?.quantity || '-'}</td>
                          <td className="p-4 text-sm">
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 uppercase">
                              {po.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ProductForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        productId={product.id} 
      />
    </div>
  );
}
