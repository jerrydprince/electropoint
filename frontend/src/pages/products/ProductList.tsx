import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useDeleteProduct } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '../../hooks/useBrands';
import { Plus, Search, Filter, Download, Edit, Trash2, Package, Tag, Briefcase, Ruler } from 'lucide-react';
import ProductForm from './ProductForm';
import Categories from '../attributes/Categories';
import Brands from '../attributes/Brands';
import Units from '../attributes/Units';

export default function ProductList() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'brands' | 'units'>('products');
  const [filters, setFilters] = useState({
    search: '',
    barcode: '',
    sku: '',
    category_id: '',
    brand_id: '',
    status: '',
    page: 1
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | number | null>(null);

  const { data: productsData, isLoading } = useProducts(filters);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const deleteProduct = useDeleteProduct();

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleExport = () => {
    if (!productsData?.data || productsData.data.length === 0) {
      alert('No data to export.');
      return;
    }
    const headers = ['SKU', 'Name', 'Category', 'Brand', 'Price', 'Cost', 'Stock Level', 'Status'];
    const csvRows = [headers.join(',')];

    productsData.data.forEach((p: any) => {
      const row = [
        p.sku,
        `"${p.name.replace(/"/g, '""')}"`,
        p.category?.name || '',
        p.brand?.name || '',
        p.price,
        p.cost,
        p.current_stock,
        p.status
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'products_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  return (
    <div className="p-6 w-full mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Master Data</h1>
          <p className="text-gray-500 mt-1">Manage your entire inventory catalog</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition shadow-sm flex items-center">
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
          <button type="button" onClick={() => { 
            console.log("Clicking Add Product, setting editId to null and isModalOpen to true");
            setEditId(null); 
            setIsModalOpen(true); 
          }} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition shadow-sm flex items-center">
            <Plus size={18} className="mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-bold flex items-center transition-colors border-b-2 ${
            activeTab === 'products'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package size={18} className="mr-2" /> Directory
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-bold flex items-center transition-colors border-b-2 ${
            activeTab === 'categories'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Tag size={18} className="mr-2" /> Categories
        </button>
        <button
          onClick={() => setActiveTab('brands')}
          className={`px-6 py-3 font-bold flex items-center transition-colors border-b-2 ${
            activeTab === 'brands'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Briefcase size={18} className="mr-2" /> Brands
        </button>
        <button
          onClick={() => setActiveTab('units')}
          className={`px-6 py-3 font-bold flex items-center transition-colors border-b-2 ${
            activeTab === 'units'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Ruler size={18} className="mr-2" /> Units of Measure
        </button>
      </div>

      {activeTab === 'products' ? (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="relative col-span-2">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input type="text" name="search" placeholder="Search product name..." value={filters.search} onChange={handleFilterChange} className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <input type="text" name="sku" placeholder="SKU" value={filters.sku} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <input type="text" name="barcode" placeholder="Barcode" value={filters.barcode} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 bg-white">
              <option value="">All Categories</option>
              {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <select name="brand_id" value={filters.brand_id} onChange={handleFilterChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 bg-white">
              <option value="">All Brands</option>
              {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Product Details</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">SKU / Barcode</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Category / Brand</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Pricing (Sell)</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-center">Stock</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading products...</td>
                </tr>
              ) : productsData?.data?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No products match your search.</td>
                </tr>
              ) : (
                productsData?.data?.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                          {product.image ? (
                            <img src={product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="text-gray-400" size={24} />
                          )}
                        </div>
                        <div>
                          <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 hover:text-primary transition-colors block">
                            {product.name}
                          </Link>
                          <span className={`inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${product.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-mono text-sm text-gray-700">{product.sku}</div>
                      {product.barcode && <div className="font-mono text-xs text-gray-400 mt-1">{product.barcode}</div>}
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-gray-800">{product.category?.name || '-'}</div>
                      <div className="text-xs text-gray-500 mt-1">{product.brand?.name || '-'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-bold text-gray-900">₦{Number(product.selling_price).toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-1">Cost: ₦{Number(product.cost_price).toFixed(2)}</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                        <span className="text-sm font-semibold text-gray-700">{product.inventories_sum_quantity || 0}</span>
                        <span className="text-xs text-gray-500 ml-1">{product.unit?.short_name || 'qty'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link to={`/products/${product.id}`} className="p-2 text-gray-500 hover:text-primary bg-gray-50 rounded-lg transition" title="View Details">
                          <Package size={18} />
                        </Link>
                        <button onClick={() => { setEditId(product.id); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-primary bg-gray-50 rounded-lg transition" title="Edit">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 rounded-lg transition" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {productsData?.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-sm">
            <div className="text-sm text-gray-500">
              Showing page {productsData?.current_page || 1} of {productsData?.last_page || 1}
            </div>
            <div className="flex gap-2">
              <button 
                disabled={filters.page === 1} 
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Prev
              </button>
              <button 
                disabled={filters.page === productsData.last_page} 
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden -m-6 p-0 mt-0">
          {activeTab === 'categories' && <Categories />}
          {activeTab === 'brands' && <Brands />}
          {activeTab === 'units' && <Units />}
        </div>
      )}

      <ProductForm 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditId(null); }} 
        productId={editId} 
      />
    </div>
  );
}
