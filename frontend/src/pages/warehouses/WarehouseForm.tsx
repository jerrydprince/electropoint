import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useWarehouse, useCreateWarehouse, useUpdateWarehouse } from '../../hooks/useWarehouses';
import { useBranches } from '../../hooks/useBranches';
import { Package, MapPin, Hash, Building2, Activity, Save, ArrowLeft } from 'lucide-react';

export default function WarehouseForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { data: warehouse, isLoading: isLoadingWarehouse } = useWarehouse(id);
  const { data: branches } = useBranches();
  
  const createWarehouse = useCreateWarehouse();
  const updateWarehouse = useUpdateWarehouse();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    status: 'active',
    branch_id: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isEditMode && warehouse) {
      setFormData({
        name: warehouse.name,
        code: warehouse.code,
        address: warehouse.address || '',
        status: warehouse.status,
        branch_id: warehouse.branch_id || '',
      });
    }
  }, [isEditMode, warehouse]);

  if (isEditMode && isLoadingWarehouse) {
    return <div className="p-6">Loading...</div>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const payload = { 
        ...formData, 
        branch_id: formData.branch_id ? Number(formData.branch_id) : null 
      };
      
      if (isEditMode) {
        await updateWarehouse.mutateAsync({ id: Number(id), data: payload });
      } else {
        await createWarehouse.mutateAsync(payload);
      }
      navigate('/company/warehouses');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center mb-8 gap-4">
        <Link to="/company/warehouses" className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Warehouse' : 'Create Warehouse'}</h1>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-primary p-4 rounded-r-xl mb-6 shadow-sm flex items-start">
          <div className="ml-3 text-red-800 text-sm font-medium">{errorMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Warehouse Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Warehouse Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="code" required value={formData.code} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Parent Branch</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <select name="branch_id" required value={formData.branch_id} onChange={handleChange} className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm appearance-none bg-white">
                  <option value="">-- Select Branch --</option>
                  {branches?.map((b: any) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                <select name="status" value={formData.status} onChange={handleChange} className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm appearance-none bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Physical Location / Address</label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link to="/company/warehouses" className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none transition-colors shadow-sm">
            Cancel
          </Link>
          <button type="submit" disabled={createWarehouse.isPending || updateWarehouse.isPending} className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-logo-red to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-red-500/30 disabled:opacity-70">
            <Save size={18} className="mr-2" />
            {isEditMode ? 'Update Warehouse' : 'Create Warehouse'}
          </button>
        </div>
      </form>
    </div>
  );
}
