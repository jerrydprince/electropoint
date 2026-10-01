import React, { useState } from 'react';
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '../../hooks/useBrands';
import { ShieldCheck, Plus, Edit, Trash2 } from 'lucide-react';

export default function Brands() {
  const { data: brands, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('status', formData.status);
    if (logoFile) payload.append('logo', logoFile);
    
    if (editingId) {
      await updateBrand.mutateAsync({ id: editingId, data: payload });
    } else {
      await createBrand.mutateAsync(payload);
    }
    setFormData({ name: '', description: '', status: 'active' });
    setLogoFile(null);
    setEditingId(null);
  };

  const handleEdit = (brand: any) => {
    setEditingId(brand.id);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      status: brand.status
    });
    setLogoFile(null);
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-6 items-start">
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <ShieldCheck className="text-primary mr-2" size={20} />
          <h2 className="font-semibold text-gray-800">{editingId ? 'Edit Brand' : 'Add Brand'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <input type="file" accept="image/*" onChange={e => e.target.files && setLogoFile(e.target.files[0])} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-primary hover:file:bg-red-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20" rows={3}></textarea>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-red-700 transition">
              {editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name: '', description: '', status: 'active'}); setLogoFile(null)}} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="w-2/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-700 w-16">Logo</th>
              <th className="p-4 font-semibold text-gray-700">Brand</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands?.map((brand: any) => (
              <tr key={brand.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  {brand.logo ? (
                    <img src={brand.logo.startsWith('http') ? brand.logo : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${brand.logo}`} alt={brand.name} className="w-8 h-8 rounded object-cover" />
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs">No</div>
                  )}
                </td>
                <td className="p-4 font-medium">{brand.name}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(brand)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={16} /></button>
                  <button onClick={() => { if(confirm('Delete this brand?')) deleteBrand.mutate(brand.id) }} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
