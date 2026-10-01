import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useBranch, useCreateBranch, useUpdateBranch } from '../../hooks/useBranches';
import { useUsers } from '../../hooks/useUsers';
import { Building, MapPin, Hash, Phone, Mail, User, Activity, Save, ArrowLeft } from 'lucide-react';

export default function BranchForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { data: branch, isLoading: isLoadingBranch } = useBranch(id);
  const { data: users } = useUsers(); // Assuming useUsers fetches all users, or we should fetch managers specifically
  
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    manager_id: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isEditMode && branch) {
      setFormData({
        name: branch.name,
        code: branch.code,
        email: branch.email || '',
        phone: branch.phone || '',
        address: branch.address || '',
        status: branch.status,
        manager_id: branch.manager_id || '',
      });
    }
  }, [isEditMode, branch]);

  if (isEditMode && isLoadingBranch) {
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
        manager_id: formData.manager_id ? Number(formData.manager_id) : null 
      };
      
      if (isEditMode) {
        await updateBranch.mutateAsync({ id: Number(id), data: payload });
      } else {
        await createBranch.mutateAsync(payload);
      }
      navigate('/company/branches');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center mb-8 gap-4">
        <Link to="/company/branches" className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition">
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Branch' : 'Create Branch'}</h1>
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
              <label className="block text-sm font-medium text-gray-700">Branch Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Branch Code</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="code" required value={formData.code} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Branch Manager</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <select name="manager_id" value={formData.manager_id} onChange={handleChange} className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm appearance-none bg-white">
                  <option value="">-- Select Manager --</option>
                  {users?.data?.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
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
              <label className="block text-sm font-medium text-gray-700">Physical Address</label>
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
          <Link to="/company/branches" className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none transition-colors shadow-sm">
            Cancel
          </Link>
          <button type="submit" disabled={createBranch.isPending || updateBranch.isPending} className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-logo-red to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-red-500/30 disabled:opacity-70">
            <Save size={18} className="mr-2" />
            {isEditMode ? 'Update Branch' : 'Create Branch'}
          </button>
        </div>
      </form>
    </div>
  );
}
