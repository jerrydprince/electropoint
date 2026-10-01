import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { format } from 'date-fns';

const JournalEntries = () => {
  const [journals, setJournals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await api.get('/journals');
        setJournals(response.data.data.data); // Assuming paginated
      } catch (error) {
        console.error("Failed to fetch journals", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJournals();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-900">Journal Entries</h1>
        <p className="text-gray-500 dark:text-gray-600">Chronological record of double-entry transactions.</p>
      </div>

      <div className="bg-white dark:bg-slate-50 rounded-xl border border-gray-200 dark:border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-900">Recent Journals</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="space-y-6">
              {journals.map((journal: any) => {
                const totalDebit = journal.lines.reduce((sum: number, line: any) => sum + Number(line.debit), 0);
                const totalCredit = journal.lines.reduce((sum: number, line: any) => sum + Number(line.credit), 0);
                
                return (
                  <div key={journal.id} className="border dark:border-gray-800 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 dark:bg-slate-100 p-4 border-b dark:border-gray-200 flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-gray-900">{journal.journal_number}</span>
                        <span className="text-gray-500 ml-4 text-sm">{format(new Date(journal.journal_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${journal.status === 'posted' ? 'bg-green-100 text-green-800 dark:bg-green-100 dark:text-green-800' : 'bg-red-100 text-red-800 dark:bg-red-100 dark:text-red-800'}`}>
                        {journal.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-600 mb-4">{journal.description}</p>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-100 dark:text-gray-700">
                            <tr>
                              <th className="px-6 py-3">Account</th>
                              <th className="px-6 py-3 text-right">Debit</th>
                              <th className="px-6 py-3 text-right">Credit</th>
                            </tr>
                          </thead>
                          <tbody>
                            {journal.lines.map((line: any) => (
                              <tr key={line.id} className="bg-white border-b dark:bg-slate-50 dark:border-gray-200">
                                <td className={`px-6 py-4 ${Number(line.credit) > 0 ? "pl-12" : "font-medium"}`}>
                                  {line.account?.name} <span className="text-gray-400 text-xs ml-2">({line.account?.code})</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {Number(line.debit) > 0 ? `₦${Number(line.debit).toLocaleString()}` : '-'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                  {Number(line.credit) > 0 ? `₦${Number(line.credit).toLocaleString()}` : '-'}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50 dark:bg-slate-100 font-semibold text-gray-900 dark:text-gray-900">
                              <td className="px-6 py-4 text-right">Total:</td>
                              <td className="px-6 py-4 text-right">₦{totalDebit.toLocaleString()}</td>
                              <td className="px-6 py-4 text-right">₦{totalCredit.toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
              {journals.length === 0 && (
                <div className="text-center py-8 text-gray-500">No journal entries found. Make a sale to generate one!</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JournalEntries;
