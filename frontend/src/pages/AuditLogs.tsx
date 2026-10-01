import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import { Activity, User, Monitor, Database, Clock } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/audit-logs?page=${page}`);
      setLogs(response.data.data.data);
      setTotalPages(response.data.data.last_page);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'created': return <span className="bg-green-100 text-green-700 px-2 py-1 text-xs font-bold rounded-md uppercase">Created</span>;
      case 'updated': return <span className="bg-blue-100 text-blue-700 px-2 py-1 text-xs font-bold rounded-md uppercase">Updated</span>;
      case 'deleted': return <span className="bg-red-100 text-red-700 px-2 py-1 text-xs font-bold rounded-md uppercase">Deleted</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 text-xs font-bold rounded-md uppercase">{action}</span>;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            <Activity className="mr-3 text-primary" size={32} /> Audit Trail
          </h1>
          <p className="text-gray-500 mt-1">Immutable record of system activities and data modifications.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100 font-bold">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Module</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8">Loading logs...</td></tr>
              ) : logs.map((log: any) => (
                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900 flex items-center">
                    <Database size={14} className="mr-2 text-gray-400" /> {log.module} #{log.record_id}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700 flex items-center">
                    <User size={14} className="mr-2 text-gray-400" /> {log.user?.name || 'System'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs flex items-center">
                    <Clock size={12} className="mr-1 text-gray-400" /> {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs flex items-center">
                    <Monitor size={12} className="mr-1 text-gray-400" /> {log.ip_address}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:underline font-medium text-xs">View Changes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-gray-500">Page {page} of {totalPages}</span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
