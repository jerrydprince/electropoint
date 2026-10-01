import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUsers, useDeleteUser } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';

export default function UserList() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: usersData, isLoading } = useUsers({ 
    search, 
    role_id: roleFilter, 
    status: statusFilter,
    page 
  });
  
  const { data: roles } = useRoles();
  const deleteUser = useDeleteUser();

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteUser.mutateAsync(id);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Link to="/users/create" className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-red-700 transition">
          Create User
        </Link>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search name, email, phone..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-[200px] p-2 border rounded"
        />
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="p-2 border rounded min-w-[150px]"
        >
          <option value="">All Roles</option>
          {roles?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="p-2 border rounded min-w-[150px]"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr>
            ) : usersData?.data?.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400">{user.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.map((r: any) => (
                      <span key={r.id} className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-800">
                        {r.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link to={`/users/${user.id}/edit`} className="text-secondary hover:text-blue-900 mr-4">Edit</Link>
                  <button onClick={() => handleDelete(user.id, user.name)} className="text-red-600 hover:text-red-900">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {usersData?.data?.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Placeholder */}
      {usersData?.last_page > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {page} of {usersData.last_page}</span>
          <button 
            disabled={page === usersData.last_page} 
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
