import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import api from "../../lib/axios";
import { Calculator, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, ShieldCheck } from "lucide-react";

const TaxManagement = () => {
  const [taxData, setTaxData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Date filters
  const [startDate, setStartDate] = useState(format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchTaxes();
  }, []);

  const fetchTaxes = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/taxes/summary', {
        params: { start_date: startDate, end_date: endDate }
      });
      if (data.success) {
        setTaxData(data.data);
      }
    } catch (error) {
      console.error("Failed to load tax data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Tax Management</h1>
          <p className="text-gray-500">Track tax liabilities and payments over time.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border-none bg-transparent text-sm font-medium text-gray-700 focus:ring-0"
          />
          <span className="text-gray-400">to</span>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border-none bg-transparent text-sm font-medium text-gray-700 focus:ring-0"
          />
          <button 
            onClick={fetchTaxes}
            className="ml-2 px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-red-700 transition shadow-sm"
          >
            Apply
          </button>
        </div>
      </div>

      {!isLoading && taxData && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-secondary">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Output Tax (Collected)</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">₦{Number(taxData.total_collected).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                <p className="text-xs text-green-600 flex items-center mt-1 font-medium">
                  <ArrowUpRight size={14} className="mr-1" />
                  From Sales
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                <Calculator size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Input Tax (Paid)</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">₦{Number(taxData.total_paid).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                <p className="text-xs text-blue-600 flex items-center mt-1 font-medium">
                  <ArrowDownRight size={14} className="mr-1" />
                  From Purchases
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${taxData.net_liability > 0 ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}`}>
                {taxData.net_liability > 0 ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Net Tax Liability</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">₦{Number(taxData.net_liability).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                <p className="text-xs text-gray-500 flex items-center mt-1 font-medium">
                  To be remitted
                </p>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tax Transactions</h2>
              <span className="text-sm text-gray-500 font-medium px-3 py-1 bg-gray-100 rounded-full">Account 2200</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Ref No.</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-right">Debit (Paid)</th>
                    <th className="px-6 py-4 text-right">Credit (Collected)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {taxData.transactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No tax transactions found.</td>
                    </tr>
                  ) : (
                    taxData.transactions.map((tx: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{format(new Date(tx.journal_date), 'MMM dd, yyyy')}</td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-secondary">{tx.journal_number}</td>
                        <td className="px-6 py-4 text-gray-600">{tx.description || '-'}</td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-medium">
                          {Number(tx.debit) > 0 ? `₦${Number(tx.debit).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-'}
                        </td>
                        <td className="px-6 py-4 text-right text-rose-600 font-medium">
                          {Number(tx.credit) > 0 ? `₦${Number(tx.credit).toLocaleString(undefined, {minimumFractionDigits: 2})}` : '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TaxManagement;
