import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCreateUser, useUpdateUser, useUser } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { User, Mail, Phone, Lock, ArrowLeft, Save, Activity, ShieldCheck } from 'lucide-react';

export default function UserForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { data: userData, isLoading: isLoadingUser } = useUser(id);
  const { data: roles, isLoading: isLoadingRoles } = useRoles();
  
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'active',
    password: '',
  });
  
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        status: userData.status || 'active',
        password: '',
      });
      if (userData.roles) {
        setSelectedRoles(userData.roles.map((r: any) => r.id));
      }
    }
  }, [isEditMode, userData]);

  if (isLoadingRoles || (isEditMode && isLoadingUser)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const payload = { ...formData, role_ids: selectedRoles };
      // Remove empty password so backend doesn't try to hash it on update
      if (isEditMode && !payload.password) {
        delete (payload as any).password;
      }

      if (isEditMode) {
        await updateUser.mutateAsync({ id: Number(id), data: payload });
      } else {
        await createUser.mutateAsync(payload);
      }
      navigate('/users');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link to="/users" className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              {isEditMode ? 'Edit User Profile' : 'Create New User'}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode ? 'Update user details and assign roles' : 'Add a new member to your organization'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-primary p-4 rounded-r-xl mb-6 shadow-sm flex items-start">
          <div className="ml-3 text-red-800 text-sm font-medium">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Profile Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <User size={20} className="text-primary mr-2" />
              Profile Information
            </h2>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    name="name" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"
                    placeholder="e.g. Jane Doe"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"
                    placeholder="jane@electropoint.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone Number <span className="text-gray-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm appearance-none bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 md:col-span-2 mt-2 pt-6 border-t border-gray-100">
                <label className="block text-sm font-medium text-gray-700">
                  {isEditMode ? 'Change Password' : 'Account Password'} 
                  <span className="text-gray-400 font-normal ml-1">
                    ({isEditMode ? 'Leave blank to keep current' : 'Leave blank to auto-generate'})
                  </span>
                </label>
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roles Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ShieldCheck size={20} className="text-primary mr-2" />
              Assign Roles
            </h2>
            <span className="text-sm text-gray-500 font-medium bg-white px-3 py-1 rounded-full border border-gray-200">
              {selectedRoles.length} selected
            </span>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles?.map(role => {
                const isSelected = selectedRoles.includes(role.id);
                const isSuperAdminSelf = isEditMode && role.slug === 'super-administrator' && userData?.id === 1;
                
                return (
                  <label 
                    key={role.id} 
                    className={`
                      relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all duration-200
                      ${isSelected 
                        ? 'border-primary ring-1 ring-primary bg-red-50/30' 
                        : 'border-gray-200 bg-white hover:border-primary/50 hover:bg-gray-50'
                      }
                      ${isSuperAdminSelf ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => handleRoleToggle(role.id)}
                      disabled={isSuperAdminSelf}
                    />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className={`block text-sm font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                          {role.name}
                        </span>
                        <span className="mt-1 flex items-center text-xs text-gray-500 line-clamp-2">
                          {role.description}
                        </span>
                      </span>
                    </span>
                    
                    <div className={`mt-0.5 ml-3 h-5 w-5 rounded-full border flex items-center justify-center flex-shrink-0 transition-colors
                      ${isSelected ? 'bg-primary border-primary text-white' : 'border-gray-300 bg-transparent'}
                    `}>
                      {isSelected && (
                        <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/users')}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors cursor-pointer shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createUser.isPending || updateUser.isPending}
            className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-logo-red to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-red-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Save size={18} className="mr-2" />
            {isEditMode ? 'Update User Profile' : 'Create User Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
