import React, { useState, useEffect } from 'react';
import { useProduct, useCreateProduct, useUpdateProduct } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { useBrands } from '../../hooks/useBrands';
import { useUnits } from '../../hooks/useUnits';
import { Package, Hash, Barcode, Image as ImageIcon, DollarSign, Layers, ShieldCheck, Tag, Save, X, Archive, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  productId?: string | number | null;
}

export default function ProductForm({ isOpen, onClose, productId }: Props) {
  console.log('ProductForm rendered with isOpen:', isOpen, 'productId:', productId);
  const isEditMode = !!productId;
  
  const { data: product, isLoading: isLoadingProduct } = useProduct(productId ? String(productId) : undefined);
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const { data: units } = useUnits();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: '', sku: '', barcode: '', model: '', description: '',
    category_id: '', brand_id: '', unit_id: '',
    cost_price: 0, selling_price: 0, wholesale_price: 0, tax_rate: 0,
    min_stock: 0, max_stock: '', reorder_level: 0,
    warranty_period: '', warranty_type: '', serial_tracking: false,
    status: 'active'
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && product) {
        setFormData({
          name: product.name, sku: product.sku, barcode: product.barcode || '', model: product.model || '', description: product.description || '',
          category_id: product.category_id || '', brand_id: product.brand_id || '', unit_id: product.unit_id || '',
          cost_price: product.cost_price, selling_price: product.selling_price, wholesale_price: product.wholesale_price, tax_rate: product.tax_rate,
          min_stock: product.min_stock, max_stock: product.max_stock || '', reorder_level: product.reorder_level,
          warranty_period: product.warranty_period || '', warranty_type: product.warranty_type || '', serial_tracking: product.serial_tracking,
          status: product.status
        });
        if (product.image) {
          setImagePreview(product.image.startsWith('http') ? product.image : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${product.image}`);
        }
      } else if (!isEditMode) {
        setFormData({
          name: '', sku: '', barcode: '', model: '', description: '',
          category_id: '', brand_id: '', unit_id: '',
          cost_price: 0, selling_price: 0, wholesale_price: 0, tax_rate: 0,
          min_stock: 0, max_stock: '', reorder_level: 0,
          warranty_period: '', warranty_type: '', serial_tracking: false,
          status: 'active'
        });
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [isOpen, isEditMode, product]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null) {
           payload.append(key, value.toString());
        }
      });
      // Serial tracking override since unchecked checkboxes aren't appended or are sent as false strings
      payload.set('serial_tracking', formData.serial_tracking ? '1' : '0');
      
      if (imageFile) {
        payload.append('image', imageFile);
      }
      
      if (isEditMode) {
        await updateProduct.mutateAsync({ id: Number(productId), data: payload });
        toast.success("Product updated successfully");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Product created successfully");
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'An error occurred during submission.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
            <p className="text-gray-500 text-xs mt-1">Fill out the information below to {isEditMode ? 'update' : 'create'} the product profile.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto relative pb-24">
          {isEditMode && isLoadingProduct ? (
            <div className="text-center py-8">Loading product data...</div>
          ) : (
            <>
              {errorMsg && (
                <div className="bg-red-50 border-l-4 border-primary p-4 rounded-r-xl mb-6 shadow-sm flex items-start">
                  <div className="ml-3 text-red-800 text-sm font-medium">{errorMsg}</div>
                </div>
              )}
              <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
        
        {/* Basic Info & Image */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Package size={20} className="text-primary mr-2" /> Basic Information
            </h2>
          </div>
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-48 shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
              <div className="w-full h-48 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group cursor-pointer hover:border-primary transition-colors">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-xs">Upload Photo</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e => {
                  if(e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="text" name="sku" required value={formData.sku} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono uppercase" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 bg-white">
                  <option value="">-- Select Category --</option>
                  {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <select name="brand_id" value={formData.brand_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 bg-white">
                  <option value="">-- Select Brand --</option>
                  {brands?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <DollarSign size={20} className="text-primary mr-2" /> Pricing configuration
            </h2>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₦</span>
                <input type="number" step="0.01" name="cost_price" value={formData.cost_price} onChange={handleChange} className="w-full pl-8 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₦</span>
                <input type="number" step="0.01" name="selling_price" value={formData.selling_price} onChange={handleChange} required className="w-full pl-8 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 border-green-300 bg-green-50/30" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wholesale Price</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">₦</span>
                <input type="number" step="0.01" name="wholesale_price" value={formData.wholesale_price} onChange={handleChange} className="w-full pl-8 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <div className="relative">
                <input type="number" step="0.01" name="tax_rate" value={formData.tax_rate} onChange={handleChange} className="w-full pr-8 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
                <span className="absolute right-4 top-2.5 text-gray-500 font-medium">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Rules */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Archive size={20} className="text-primary mr-2" /> Inventory & Stock Rules
            </h2>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
              <select name="unit_id" value={formData.unit_id} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 bg-white">
                <option value="">-- Select Unit --</option>
                {units?.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Stock</label>
              <input type="number" name="min_stock" value={formData.min_stock} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Stock</label>
              <input type="number" name="max_stock" value={formData.max_stock} onChange={handleChange} placeholder="Optional" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
              <input type="number" name="reorder_level" value={formData.reorder_level} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 border-orange-300" />
            </div>
          </div>
        </div>

        {/* Warranty & Advanced */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ShieldCheck size={20} className="text-primary mr-2" /> Warranty & Configuration
            </h2>
          </div>
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Period (Months)</label>
              <input type="number" name="warranty_period" value={formData.warranty_period} onChange={handleChange} placeholder="e.g. 12" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Warranty Type</label>
              <select name="warranty_type" value={formData.warranty_type} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 bg-white">
                <option value="">None</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Store">Store</option>
              </select>
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" name="serial_tracking" checked={formData.serial_tracking} onChange={handleChange} className="w-5 h-5 text-primary rounded focus:ring-primary" />
                <span className="ml-2 text-sm font-medium text-gray-800">Require Serial Number Tracking</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity size={24} className="text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-800">Product Status</h3>
              <p className="text-sm text-gray-500">Inactive products are hidden from POS.</p>
            </div>
          </div>
          <select name="status" value={formData.status} onChange={handleChange} className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 bg-white font-medium text-gray-700">
            <option value="active">Active (Available)</option>
            <option value="inactive">Inactive (Hidden)</option>
          </select>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4 absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="product-form" disabled={createProduct.isPending || updateProduct.isPending} className="inline-flex items-center px-8 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-logo-red to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-red-500/30 disabled:opacity-70">
            <Save size={18} className="mr-2" />
            {isEditMode ? 'Update Product' : 'Save Product'}
          </button>
        </div>
      </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
