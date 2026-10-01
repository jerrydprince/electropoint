import React, { useState } from 'react';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, useSupplier } from '../../hooks/useSuppliers';
import { Users, Plus, Search, Building2, Phone, Mail, FileText, ArrowLeft, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SupplierInvoices, SupplierPayments, SupplierStatement } from './SupplierFinanceTabs';

export default function SupplierManager() {
  const [view, setView] = useState<'list' | 'profile'>('list');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreate = () => {
    setSelectedId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const handleView = (id: string) => {
    setSelectedId(id);
    setView('profile');
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col relative pb-20">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          {view !== 'list' && (
            <button onClick={() => setView('list')} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center">
              <Building2 className="mr-2 text-primary" size={24} />
              {view === 'list' ? 'Supplier Management' : 'Supplier Profile'}
            </h1>
          </div>
        </div>
        {view === 'list' && (
          <button type="button" onClick={handleCreate} className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center shadow-sm">
            <Plus size={18} className="mr-2" />
            Add Supplier
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {view === 'list' && <SupplierList onView={handleView} onEdit={handleEdit} />}
        {view === 'profile' && selectedId && <SupplierProfile id={selectedId} onEdit={() => handleEdit(selectedId)} />}
      </div>

      <SupplierForm 
        isOpen={isModalOpen} 
        id={selectedId} 
        onSave={() => setIsModalOpen(false)} 
        onCancel={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

function SupplierList({ onView, onEdit }: { onView: (id: string) => void, onEdit: (id: string) => void }) {
  const [search, setSearch] = useState('');
  const { data: suppliersData, isLoading } = useSuppliers({ search });
  const deleteSupplier = useDeleteSupplier();

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading suppliers...</div>;

  const suppliers = suppliersData?.data || [];

  return (
    <div className="w-full mx-auto animate-fade-in">
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search suppliers by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {suppliers.length === 0 ? (
          <div className="col-span-full bg-white p-8 rounded-2xl border text-center text-gray-500 shadow-sm">
            <Building2 className="mx-auto text-gray-300 mb-3" size={32} />
            No suppliers found. Click "Add Supplier" to create one.
          </div>
        ) : (
          suppliers.map((supplier: any) => (
            <div key={supplier.id} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onView(supplier.id)}>
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                    {supplier.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{supplier.name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${supplier.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {supplier.status}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(supplier.id)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => {
                      if (window.confirm('Delete this supplier?')) deleteSupplier.mutate(supplier.id);
                    }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {supplier.email && <div className="flex items-center"><Mail size={14} className="mr-2 text-gray-400" /> {supplier.email}</div>}
                {supplier.phone && <div className="flex items-center"><Phone size={14} className="mr-2 text-gray-400" /> {supplier.phone}</div>}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  {supplier.contacts?.length || 0} Contacts
                </div>
                <button onClick={() => onView(supplier.id)} className="text-primary text-sm font-medium hover:underline">
                  View Profile &rarr;
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SupplierForm({ isOpen, id, onSave, onCancel }: { isOpen: boolean, id: string | null, onSave: () => void, onCancel: () => void }) {
  const { data: supplier, isLoading } = useSupplier(id ? String(id) : '');
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', tax_number: '', credit_limit: '', bank_details: '', status: 'active',
    contacts: [{ name: '', email: '', phone: '', position: '', is_primary: true }]
  });

  React.useEffect(() => {
    if (supplier) {
      setFormData({
        ...supplier,
        credit_limit: supplier.credit_limit || '',
        contacts: supplier.contacts?.length ? supplier.contacts : [{ name: '', email: '', phone: '', position: '', is_primary: true }]
      });
    }
  }, [supplier]);

  if (!isOpen) return null;

  if (id && isLoading) return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-xl flex items-center justify-center">
        <div className="text-gray-500 font-medium">Loading supplier data...</div>
      </div>
    </div>
  );

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (index: number, field: string, value: any) => {
    const newContacts = [...formData.contacts];
    newContacts[index] = { ...newContacts[index], [field]: value };
    if (field === 'is_primary' && value === true) {
      newContacts.forEach((c, i) => { if (i !== index) c.is_primary = false; });
    }
    setFormData({ ...formData, contacts: newContacts });
  };

  const addContact = () => {
    setFormData({ ...formData, contacts: [...formData.contacts, { name: '', email: '', phone: '', position: '', is_primary: false }] });
  };

  const removeContact = (index: number) => {
    setFormData({ ...formData, contacts: formData.contacts.filter((_, i) => i !== index) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const action = id ? updateSupplier.mutateAsync({ id, data: formData }) : createSupplier.mutateAsync(formData);
    action.then(() => {
      toast.success(`Supplier ${id ? 'updated' : 'created'} successfully!`);
      onSave();
    }).catch(err => {
      toast.error(err.response?.data?.message || 'Error saving supplier');
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white shrink-0">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {id ? 'Edit Supplier' : 'Add New Supplier'}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <Trash2 className="hidden" /> {/* Keep icon import active if needed elsewhere */}
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto relative pb-24">
          <form id="supplier-form" onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-2">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea name="address" value={formData.address} onChange={handleChange} rows={2} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Number / VAT</label>
              <input type="text" name="tax_number" value={formData.tax_number} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Credit Limit</label>
              <input type="number" name="credit_limit" value={formData.credit_limit} onChange={handleChange} step="0.01" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Details</label>
              <textarea name="bank_details" value={formData.bank_details} onChange={handleChange} rows={2} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6 border-b pb-2">
            <h2 className="text-lg font-bold text-gray-900">Contacts</h2>
            <button type="button" onClick={addContact} className="text-sm text-primary font-medium flex items-center hover:underline">
              <Plus size={16} className="mr-1" /> Add Contact
            </button>
          </div>

          <div className="space-y-6">
            {formData.contacts.map((contact, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative">
                {index > 0 && (
                  <button type="button" onClick={() => removeContact(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition">
                    <Trash2 size={16} />
                  </button>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Contact Name *</label>
                    <input type="text" required value={contact.name} onChange={(e) => handleContactChange(index, 'name', e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Position / Title</label>
                    <input type="text" value={contact.position} onChange={(e) => handleContactChange(index, 'position', e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                    <input type="email" value={contact.email} onChange={(e) => handleContactChange(index, 'email', e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                    <input type="text" value={contact.phone} onChange={(e) => handleContactChange(index, 'phone', e.target.value)} className="w-full px-3 py-1.5 border rounded-lg text-sm" />
                  </div>
                  <div className="md:col-span-2 flex items-center mt-2">
                    <input type="checkbox" id={`primary-${index}`} checked={contact.is_primary} onChange={(e) => handleContactChange(index, 'is_primary', e.target.checked)} className="mr-2 rounded text-primary focus:ring-primary" />
                    <label htmlFor={`primary-${index}`} className="text-sm text-gray-700">Primary Contact</label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="supplier-form" disabled={createSupplier.isPending || updateSupplier.isPending} className="inline-flex items-center px-8 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-logo-red to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-red-500/30 disabled:opacity-70">
            {createSupplier.isPending || updateSupplier.isPending ? 'Saving...' : 'Save Supplier'}
          </button>
        </div>
      </form>
      </div>
      </div>
    </div>
  );
}

function SupplierProfile({ id, onEdit }: { id: string, onEdit: () => void }) {
  const { data: supplier, isLoading } = useSupplier(id);
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'payments' | 'statement'>('overview');

  if (isLoading || !supplier) return <div className="text-center py-8">Loading profile...</div>;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6 pb-20">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-3xl shrink-0 border-4 border-white shadow-sm">
            {supplier.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{supplier.name}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
              {supplier.tax_number && <span className="flex items-center"><FileText size={16} className="mr-1 text-gray-400" /> VAT: {supplier.tax_number}</span>}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${supplier.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {supplier.status}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onEdit} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-xl font-medium hover:bg-gray-200 transition flex items-center">
          <Edit2 size={18} className="mr-2" /> Edit Profile
        </button>
      </div>

      <div className="bg-white border-b sticky top-20 z-10 px-6 mt-4">
        <div className="flex space-x-6">
          {['overview', 'invoices', 'payments', 'statement'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`py-3 font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 border-b pb-3 mb-4">Contact Information</h3>
                <div className="space-y-4 text-sm text-gray-600">
                  {supplier.email && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Email</label>
                      <a href={`mailto:${supplier.email}`} className="text-primary hover:underline flex items-center"><Mail size={14} className="mr-1"/> {supplier.email}</a>
                    </div>
                  )}
                  {supplier.phone && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Phone</label>
                      <a href={`tel:${supplier.phone}`} className="text-gray-900 flex items-center"><Phone size={14} className="mr-1"/> {supplier.phone}</a>
                    </div>
                  )}
                  {supplier.address && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Address</label>
                      <div className="text-gray-900">{supplier.address}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 border-b pb-3 mb-4">Financials</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Credit Limit</label>
                    <div className="text-gray-900 font-medium">{supplier.credit_limit ? `₦${parseFloat(supplier.credit_limit).toLocaleString()}` : 'No limit set'}</div>
                  </div>
                  {supplier.bank_details && (
                    <div>
                      <label className="text-xs text-gray-400 uppercase font-bold block mb-1">Bank Details</label>
                      <div className="text-gray-900 whitespace-pre-wrap">{supplier.bank_details}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 border-b pb-3 mb-4">Key Contacts</h3>
                <div className="space-y-4">
                  {supplier.contacts?.map((contact: any) => (
                    <div key={contact.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="font-bold text-sm text-gray-900 flex justify-between">
                        {contact.name}
                        {contact.is_primary && <span className="text-[10px] uppercase bg-blue-100 text-blue-700 px-1.5 rounded">Primary</span>}
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{contact.position || 'Contact'}</div>
                      <div className="space-y-1">
                        {contact.email && <div className="text-xs flex items-center text-gray-600"><Mail size={12} className="mr-1"/> {contact.email}</div>}
                        {contact.phone && <div className="text-xs flex items-center text-gray-600"><Phone size={12} className="mr-1"/> {contact.phone}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b flex justify-between items-center">
                  <h3 className="font-bold text-gray-900">Recent Purchase Orders</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 border-b border-gray-100">
                    <tr>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Ref</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm text-right">Amount</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(!supplier.purchase_orders || supplier.purchase_orders.length === 0) ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">No purchase orders found for this supplier.</td>
                      </tr>
                    ) : (
                      supplier.purchase_orders.slice(0, 10).map((po: any) => (
                        <tr key={po.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-4 font-medium text-gray-900">{po.reference}</td>
                          <td className="p-4 text-sm text-gray-600">{new Date(po.created_at).toLocaleDateString()}</td>
                          <td className="p-4 text-sm font-bold text-gray-900 text-right">₦{parseFloat(po.total_amount).toLocaleString()}</td>
                          <td className="p-4 text-sm capitalize">{po.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'invoices' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SupplierInvoices supplierId={id} pos={supplier.purchase_orders || []} />
          </div>
        )}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SupplierPayments supplierId={id} />
          </div>
        )}
        {activeTab === 'statement' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SupplierStatement supplierId={id} />
          </div>
        )}
      </div>
    </div>
  );
}
