import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useCreateRole, useUpdateRole, useRole } from '../../hooks/useRoles';
import { usePermissionsGrouped } from '../../hooks/usePermissions';
import { ArrowLeft } from 'lucide-react';

export default function RoleForm() {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const { data: roleData, isLoading: isLoadingRole } = useRole(id);
  const { data: permissionsGrouped, isLoading: isLoadingPermissions } = usePermissionsGrouped();
  
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && roleData) {
      setName(roleData.name);
      setDescription(roleData.description || '');
      if (roleData.permissions) {
        setSelectedPermissions(roleData.permissions.map(p => p.id));
      }
    }
  }, [isEditMode, roleData]);

  if (isLoadingPermissions || (isEditMode && isLoadingRole)) {
    return <div className="p-6">Loading...</div>;
  }

  const handlePermissionToggle = (permId: number) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  const handleGroupToggle = (groupId: string, selectAll: boolean) => {
    const groupPermIds = permissionsGrouped?.[groupId]?.map(p => p.id) || [];
    if (selectAll) {
      setSelectedPermissions(prev => Array.from(new Set([...prev, ...groupPermIds])));
    } else {
      setSelectedPermissions(prev => prev.filter(id => !groupPermIds.includes(id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const payload = { name, description, permissions: selectedPermissions };
      if (isEditMode) {
        await updateRole.mutateAsync({ id: Number(id), data: payload });
      } else {
        await createRole.mutateAsync(payload);
      }
      navigate('/roles');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link to="/roles" className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition shadow-sm">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{isEditMode ? 'Edit Role' : 'Create Role'}</h1>
          </div>
        </div>
        <button type="button" onClick={() => navigate('/roles')} className="text-gray-600 hover:text-gray-900 font-medium">Cancel</button>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Role Details</h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                disabled={isEditMode && roleData?.slug === 'super-administrator'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-primary focus:border-primary"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2">Permission Matrix</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {permissionsGrouped && Object.entries(permissionsGrouped).map(([group, perms]) => {
              const allSelected = perms.every(p => selectedPermissions.includes(p.id));
              
              return (
                <div key={group} className="border border-gray-200 rounded p-4">
                  <div className="flex items-center justify-between mb-3 border-b pb-2">
                    <h3 className="font-semibold text-gray-800 capitalize">{group.replace('_', ' ')}</h3>
                    <button
                      type="button"
                      onClick={() => handleGroupToggle(group, !allSelected)}
                      className="text-xs text-secondary hover:underline"
                    >
                      {allSelected ? 'Clear All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {perms.map(perm => (
                      <label key={perm.id} className="flex items-start space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-1 rounded text-primary focus:ring-primary"
                          checked={selectedPermissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          disabled={isEditMode && roleData?.slug === 'super-administrator'}
                        />
                        <span className="text-sm text-gray-600">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={createRole.isPending || updateRole.isPending}
            className="bg-primary text-white px-6 py-2 rounded shadow hover:bg-red-700 transition disabled:opacity-50"
          >
            {isEditMode ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  );
}
