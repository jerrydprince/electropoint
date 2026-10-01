import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../../lib/axios";
import { FileText, Download, Filter } from "lucide-react";

const GeneralLedger = () => {
  const [ledgerLines, setLedgerLines] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedAccount, setSelectedAccount] = useState("");
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchAccounts();
    fetchLedger();
  }, []);

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get('/chart-of-accounts');
      if (data.success) {
        setAccounts(data.data);
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/ledger', {
        params: {
          account_id: selectedAccount || undefined,
          start_date: startDate,
          end_date: endDate
        }
      });
      if (data.success) {
        setLedgerLines(data.data);
      }
    } catch (error) {
      console.error("Failed to load ledger:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    // Generate CSV content
    const headers = ['Date', 'Account', 'Ref No.', 'Description', 'Debit', 'Credit', 'Balance'];
    const rows = ledgerLines.map(line => [
      format(new Date(line.journal_date), 'yyyy-MM-dd'),
      `${line.account?.code} - ${line.account?.name}`,
      line.journal_number,
      line.description || '',
      line.debit,
      line.credit,
      line.running_balance
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `general_ledger_${format(new Date(), 'yyyyMMdd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-900">General Ledger</h1>
          <p className="text-gray-500 dark:text-gray-600">Detailed transaction history grouped by account.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportCsv}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center font-medium shadow-sm transition"
          >
            <Download size={18} className="mr-2 text-gray-500" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-50 rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Filter</label>
            <select 
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border-gray-300 rounded-lg shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
          <button 
            onClick={fetchLedger}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-700 flex items-center shadow-sm transition"
          >
            <Filter size={18} className="mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Ref No.</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-right">Debit (₦)</th>
                <th className="px-6 py-4 text-right">Credit (₦)</th>
                <th className="px-6 py-4 text-right">Balance (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading ledger data...</td>
                </tr>
              ) : ledgerLines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No transactions found for the selected criteria.</td>
                </tr>
              ) : (
                ledgerLines.map((line, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">{format(new Date(line.journal_date), 'MMM dd, yyyy')}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {line.account?.name} <span className="text-gray-400 font-normal ml-1">({line.account?.code})</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{line.journal_number}</td>
                    <td className="px-6 py-4 text-gray-600">{line.description || '-'}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{Number(line.debit) > 0 ? Number(line.debit).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{Number(line.credit) > 0 ? Number(line.credit).toLocaleString(undefined, {minimumFractionDigits: 2}) : '-'}</td>
                    <td className={`px-6 py-4 text-right font-semibold ${Number(line.running_balance) < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      {Number(Math.abs(line.running_balance)).toLocaleString(undefined, {minimumFractionDigits: 2})} {Number(line.running_balance) < 0 ? 'CR' : 'DR'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralLedger;
