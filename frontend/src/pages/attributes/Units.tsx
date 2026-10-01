import React, { useState } from 'react';
import { useUnits, useCreateUnit, useUpdateUnit, useDeleteUnit } from '../../hooks/useUnits';
import { Scale, Plus, Edit, Trash2 } from 'lucide-react';

export default function Units() {
  const { data: units, isLoading } = useUnits();
  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit();
  const deleteUnit = useDeleteUnit();

  const [formData, setFormData] = useState({ name: '', short_name: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateUnit.mutateAsync({ id: editingId, data: formData });
    } else {
      await createUnit.mutateAsync(formData);
    }
    setFormData({ name: '', short_name: '' });
    setEditingId(null);
  };

  const handleEdit = (unit: any) => {
    setEditingId(unit.id);
    setFormData({ name: unit.name, short_name: unit.short_name });
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto flex gap-6 items-start">
      <div className="w-1/3 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center">
          <Scale className="text-primary mr-2" size={20} />
          <h2 className="font-semibold text-gray-800">{editingId ? 'Edit Unit' : 'Add Unit'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Pieces" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
            <input type="text" value={formData.short_name} onChange={e => setFormData({...formData, short_name: e.target.value})} placeholder="e.g. pcs" required className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary/20" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-red-700 transition">
              {editingId ? 'Update' : 'Save'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name: '', short_name: ''})}} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">
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
              <th className="p-4 font-semibold text-gray-700">Unit Name</th>
              <th className="p-4 font-semibold text-gray-700">Short Name</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units?.map((unit: any) => (
              <tr key={unit.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4 font-medium">{unit.name}</td>
                <td className="p-4 text-gray-500 font-mono text-sm">{unit.short_name}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => handleEdit(unit)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={16} /></button>
                  <button onClick={() => { if(confirm('Delete this unit?')) deleteUnit.mutate(unit.id) }} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
