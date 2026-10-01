import { Link } from 'react-router-dom';
import { useRoles, useDeleteRole } from '../../hooks/useRoles';

export default function RoleList() {
  const { data: roles, isLoading, error } = useRoles();
  const deleteRole = useDeleteRole();

  if (isLoading) return <div className="p-6">Loading roles...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading roles</div>;

  const handleDelete = async (id: number, name: string) => {
    if (name === 'Super Administrator') {
      alert('Cannot delete the Super Administrator role.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the ${name} role?`)) {
      try {
        await deleteRole.mutateAsync(id);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete role.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <Link to="/roles/create" className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-red-700 transition">
          Create Role
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles?.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{role.name}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 truncate max-w-md">{role.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {role.users_count || 0} users
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link to={`/roles/${role.id}/edit`} className="text-secondary hover:text-blue-900 mr-4">Edit</Link>
                  <button onClick={() => handleDelete(role.id, role.name)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {roles?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No roles found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
