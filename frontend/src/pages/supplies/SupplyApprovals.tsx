import React, { useState } from 'react';
import { useSupplyRequests, useProcessSupplyRequest } from '../../hooks/useSupplies';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplyApprovals() {
  const { data: requestsData, isLoading } = useSupplyRequests({ status: 'pending' }); // For a real app we'd fetch all or add filters
  const { data: allRequests } = useSupplyRequests(); // Fetching all for now to show history
  const processRequest = useProcessSupplyRequest();

  const [processingId, setProcessingId] = useState<number | null>(null);
  const [issueData, setIssueData] = useState<any[]>([]);

  const requests = Array.isArray(allRequests) ? allRequests : allRequests?.data || [];
  const pendingRequests = requests.filter((r: any) => ['pending', 'approved', 'partially_issued'].includes(r.status));
  const historyRequests = requests.filter((r: any) => ['fully_issued', 'rejected'].includes(r.status));

  const startProcessing = (req: any) => {
    setProcessingId(req.id);
    setIssueData(req.items.map((item: any) => ({
      id: item.id,
      supply_id: item.supply_id,
      name: item.supply?.name,
      requested: item.quantity_requested,
      already_issued: item.quantity_issued,
      quantity_to_issue: item.quantity_requested - item.quantity_issued
    })));
  };

  const handleIssueChange = (index: number, val: string) => {
    const newData = [...issueData];
    newData[index].quantity_to_issue = parseInt(val) || 0;
    setIssueData(newData);
  };

  const handleProcess = (status: 'approved' | 'rejected') => {
    if (!processingId) return;

    const payload = {
      status,
      items: status === 'approved' ? issueData : undefined
    };

    processRequest.mutate({ id: processingId, data: payload }, {
      onSuccess: () => {
        toast.success(`Request ${status} successfully`);
        setProcessingId(null);
      },
      onError: (err: any) => toast.error(err.response?.data?.message || 'Error processing request')
    });
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-12">
      
      {/* Pending / Processing Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pending Requests & Issuance</h2>
        <div className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border rounded-xl">No pending requests to process.</div>
          ) : (
            pendingRequests.map((req: any) => (
              <div key={req.id} className="border border-blue-100 rounded-xl p-6 bg-blue-50/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900">Request #{req.id} - {req.branch?.name}</h4>
                    <p className="text-sm text-gray-500">Requested by: {req.user?.name} | {new Date(req.created_at).toLocaleString()}</p>
                    <p className="text-sm text-gray-700 mt-1">{req.notes}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>

                {processingId === req.id ? (
                  <div className="bg-white p-4 rounded-lg border mt-4">
                    <h5 className="font-bold text-sm mb-3">Issue Supplies</h5>
                    <table className="w-full text-left text-sm mb-4">
                      <thead>
                        <tr className="text-gray-500 border-b">
                          <th className="pb-2">Item</th>
                          <th className="pb-2 text-center">Req.</th>
                          <th className="pb-2 text-center">Issued</th>
                          <th className="pb-2 text-right">Qty to Issue Now</th>
                        </tr>
                      </thead>
                      <tbody>
                        {issueData.map((item, idx) => (
                          <tr key={item.id}>
                            <td className="py-2 font-medium">{item.name}</td>
                            <td className="py-2 text-center">{item.requested}</td>
                            <td className="py-2 text-center text-green-600">{item.already_issued}</td>
                            <td className="py-2 text-right">
                              <input type="number" min="0" max={item.requested - item.already_issued} value={item.quantity_to_issue} onChange={e => handleIssueChange(idx, e.target.value)} className="w-24 p-1 border rounded text-right" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button onClick={() => setProcessingId(null)} className="px-4 py-2 border rounded-lg text-sm">Cancel</button>
                      <button onClick={() => handleProcess('rejected')} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg text-sm hover:bg-red-200">Reject Request</button>
                      <button onClick={() => handleProcess('approved')} disabled={processRequest.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-red-700">Confirm Issue</button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-blue-100 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      {req.items?.length} items requested.
                    </div>
                    <button onClick={() => startProcessing(req)} className="px-4 py-2 bg-white border shadow-sm rounded-lg text-sm font-bold text-primary hover:bg-gray-50">
                      Process & Issue
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* History Section */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Processing History</h2>
        <div className="space-y-4">
          {historyRequests.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border rounded-xl">No history found.</div>
          ) : (
            historyRequests.map((req: any) => (
              <div key={req.id} className="border rounded-xl p-4 bg-white shadow-sm flex justify-between items-center opacity-75">
                <div>
                  <h4 className="font-bold text-gray-900">Request #{req.id} - {req.branch?.name}</h4>
                  <p className="text-xs text-gray-500">{new Date(req.created_at).toLocaleString()}</p>
                </div>
                <div className="text-right flex items-center">
                  {req.status === 'fully_issued' ? <Check className="text-green-500 mr-2" size={18} /> : <X className="text-red-500 mr-2" size={18} />}
                  <span className={`text-xs font-bold uppercase ${req.status === 'fully_issued' ? 'text-green-700' : 'text-red-700'}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
