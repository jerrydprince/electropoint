import React, { useState } from 'react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../../hooks/useCategories';
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react';

export default function Categories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [formData, setFormData] = useState({ name: '', description: '', parent_id: '', status: 'active' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, parent_id: formData.parent_id ? Number(formData.parent_id) : null };
    
    if (editingId) {
      await updateCategory.mutateAsync({ id: editingId, data: payload });
    } else {
      await createCategory.mutateAsync(payload);
    }
    setFormData({ name: '', description: '', parent_id: '', status: 'active' });
    setEditingId(null);
  };

  const handleEdit = (cat: any) => {
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description || '',
      parent_id: cat.parent_id || '',
      status: cat.status
    });
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-6 items-start">
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <FolderTree className="text-primary mr-2" size={20} />
          <h2 className="font-semibold text-gray-800">{editingId ? 'Edit Category' : 'Add Category'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
            <select value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})} className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20 bg-white">
              <option value="">-- None (Top Level) --</option>
              {categories?.filter((c: any) => c.id !== editingId).map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
              <button type="button" onClick={() => {setEditingId(null); setFormData({name: '', description: '', parent_id: '', status: 'active'})}} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
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
              <th className="p-4 font-semibold text-gray-700">Category</th>
              <th className="p-4 font-semibold text-gray-700">Parent</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat: any) => (
              <tr key={cat.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-gray-500">{cat.parent?.name || '-'}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(cat)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={16} /></button>
                  <button onClick={() => { if(confirm('Delete this category?')) deleteCategory.mutate(cat.id) }} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
