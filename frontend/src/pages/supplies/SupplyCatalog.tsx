import React, { useState } from 'react';
import { useSupplies, useCreateSupply, useSupplyCategories, useCreateSupplyCategory } from '../../hooks/useSupplies';
import { Plus, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplyCatalog() {
  const { data: supplies, isLoading: loadingSupplies } = useSupplies();
  const { data: categories, isLoading: loadingCategories } = useSupplyCategories();
  const createSupply = useCreateSupply();
  const createCategory = useCreateSupplyCategory();

  const [showSupplyForm, setShowSupplyForm] = useState(false);
  const [showCatForm, setShowCatForm] = useState(false);
  
  const [supplyData, setSupplyData] = useState({ supply_category_id: '', name: '', sku: '', unit: 'pcs', reorder_level: 10, description: '' });
  const [catData, setCatData] = useState({ name: '', description: '' });

  const handleSupplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSupply.mutate(supplyData, {
      onSuccess: () => {
        toast.success("Supply added to catalog");
        setShowSupplyForm(false);
        setSupplyData({ supply_category_id: '', name: '', sku: '', unit: 'pcs', reorder_level: 10, description: '' });
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error adding supply')
    });
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate(catData, {
      onSuccess: () => {
        toast.success("Category created");
        setShowCatForm(false);
        setCatData({ name: '', description: '' });
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error creating category')
    });
  };

  if (loadingSupplies || loadingCategories) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-8">
      {/* Supplies List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Supply Catalog</h2>
          <div className="space-x-3">
            <button onClick={() => setShowCatForm(!showCatForm)} className="px-4 py-2 border rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex inline-flex items-center">
              <Tag size={16} className="mr-1" /> New Category
            </button>
            <button onClick={() => setShowSupplyForm(!showSupplyForm)} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-red-700 flex inline-flex items-center">
              <Plus size={16} className="mr-1" /> Add Supply Item
            </button>
          </div>
        </div>

        {showCatForm && (
          <form onSubmit={handleCatSubmit} className="bg-gray-50 p-6 rounded-xl border mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Create Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={catData.name} onChange={e => setCatData({...catData, name: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={catData.description} onChange={e => setCatData({...catData, description: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCatForm(false)} className="px-4 py-2 bg-white border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={createCategory.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Save</button>
            </div>
          </form>
        )}

        {showSupplyForm && (
          <form onSubmit={handleSupplySubmit} className="bg-gray-50 p-6 rounded-xl border mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Add Supply Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select required value={supplyData.supply_category_id} onChange={e => setSupplyData({...supplyData, supply_category_id: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="">Select Category</option>
                  {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={supplyData.name} onChange={e => setSupplyData({...supplyData, name: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input type="text" value={supplyData.sku} onChange={e => setSupplyData({...supplyData, sku: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                <select required value={supplyData.unit} onChange={e => setSupplyData({...supplyData, unit: e.target.value})} className="w-full p-2 border rounded-lg">
                  <option value="pcs">Pieces</option>
                  <option value="pack">Pack</option>
                  <option value="box">Box</option>
                  <option value="roll">Roll</option>
                  <option value="ream">Ream</option>
                  <option value="kg">Kg</option>
                  <option value="ltr">Liter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Level</label>
                <input required type="number" min="0" value={supplyData.reorder_level} onChange={e => setSupplyData({...supplyData, reorder_level: parseInt(e.target.value)})} className="w-full p-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input type="text" value={supplyData.description} onChange={e => setSupplyData({...supplyData, description: e.target.value})} className="w-full p-2 border rounded-lg" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSupplyForm(false)} className="px-4 py-2 bg-white border rounded-lg text-sm">Cancel</button>
              <button type="submit" disabled={createSupply.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm">Save Supply</button>
            </div>
          </form>
        )}

        <table className="w-full text-left border rounded-xl overflow-hidden">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600 text-sm">Item Name</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">SKU</th>
              <th className="p-4 font-semibold text-gray-600 text-sm">Unit</th>
              <th className="p-4 font-semibold text-gray-600 text-sm text-right">Reorder Lvl</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!supplies || supplies.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No supplies found in catalog.</td></tr>
            ) : (
              supplies.map((s: any) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-900">{s.name}</td>
                  <td className="p-4 text-gray-600 text-sm"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{s.category?.name}</span></td>
                  <td className="p-4 text-gray-600 text-sm">{s.sku || '-'}</td>
                  <td className="p-4 text-gray-600 text-sm uppercase">{s.unit}</td>
                  <td className="p-4 font-medium text-gray-900 text-right">{s.reorder_level}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
