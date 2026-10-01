import { Link } from 'react-router-dom';
import { useBranches, useDeleteBranch } from '../../hooks/useBranches';
import { Plus, Edit, Trash2, Building } from 'lucide-react';

export default function BranchList() {
  const { data: branches, isLoading } = useBranches();
  const deleteBranch = useDeleteBranch();

  if (isLoading) return <div className="p-6">Loading branches...</div>;

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      await deleteBranch.mutateAsync(id);
    }
  };

  return (
    <div className="p-6 w-full mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-500">Manage your store locations</p>
        </div>
        <Link to="/company/branches/create" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center shadow-sm">
          <Plus size={18} className="mr-1" /> Add Branch
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 font-semibold text-gray-700">Code</th>
              <th className="p-4 font-semibold text-gray-700">Branch Name</th>
              <th className="p-4 font-semibold text-gray-700">Manager</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {branches?.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No branches found.</td>
              </tr>
            ) : (
              branches?.map((branch: any) => (
                <tr key={branch.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-mono text-sm text-gray-600">{branch.code}</td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{branch.name}</div>
                    <div className="text-xs text-gray-500">{branch.email}</div>
                  </td>
                  <td className="p-4 text-gray-600">{branch.manager?.name || '-'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${branch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {branch.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Link to={`/company/branches/${branch.id}/edit`} className="inline-flex p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition">
                      <Edit size={16} />
                    </Link>
                    <button onClick={() => handleDelete(branch.id)} className="inline-flex p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
