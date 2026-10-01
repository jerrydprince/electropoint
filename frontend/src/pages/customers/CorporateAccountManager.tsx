import React, { useState } from 'react';
import { useCustomers } from '../../hooks/useCustomers';
import { useCorporatePlans, useDeleteCorporatePlan } from '../../hooks/useCorporatePlans';
import { Building2, Search, Plus, Edit, Trash2, Mail, Phone, ChevronRight, Award, MapPin } from 'lucide-react';
import CorporateAccountForm from './CorporateAccountForm';
import CorporatePlanForm from './CorporatePlanForm';
import toast from 'react-hot-toast';

export default function CorporateAccountManager() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'plans'>('accounts');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isAccountFormOpen, setIsAccountFormOpen] = useState(false);
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<number | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

  const { data: customersData, isLoading: loadingAccounts } = useCustomers();
  const { data: plansData, isLoading: loadingPlans } = useCorporatePlans();
  const deletePlan = useDeleteCorporatePlan();

  const allCustomers = Array.isArray(customersData) ? customersData : customersData?.data || [];
  const corporateAccounts = allCustomers.filter((c: any) => c.customer_type === 'corporate');
  
  const allPlans = Array.isArray(plansData) ? plansData : plansData?.data || [];

  const filteredAccounts = corporateAccounts.filter((c: any) => 
    (c.company_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone?.includes(searchQuery))
  );

  const handleEditAccount = (id: number) => {
    setEditingAccountId(id);
    setIsAccountFormOpen(true);
  };

  const handleEditPlan = (id: number) => {
    setEditingPlanId(id);
    setIsPlanFormOpen(true);
  };

  const handleDeletePlan = (id: number) => {
    if (window.confirm("Are you sure you want to delete this Corporate Plan?")) {
      deletePlan.mutate(String(id), {
        onSuccess: () => toast.success("Plan deleted successfully"),
        onError: () => toast.error("Failed to delete plan")
      });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
            <Building2 className="mr-3 text-primary" size={32} /> Corporate Management
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Manage B2B corporate accounts and discount plans</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setEditingPlanId(null); setIsPlanFormOpen(true); }}
            className="flex items-center px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition shadow-sm"
          >
            <Award size={18} className="mr-2 text-primary" /> New Plan
          </button>
          <button 
            onClick={() => { setEditingAccountId(null); setIsAccountFormOpen(true); }}
            className="flex items-center px-4 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-red-700 transition shadow-sm"
          >
            <Plus size={18} className="mr-2" /> New Corporate Account
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8 flex items-center">
        <button 
          onClick={() => setActiveTab('accounts')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider text-center transition ${activeTab === 'accounts' ? 'bg-gray-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Corporate Organizations
        </button>
        <button 
          onClick={() => setActiveTab('plans')}
          className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider text-center transition ${activeTab === 'plans' ? 'bg-gray-50 text-primary border-b-2 border-primary' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          Corporate Discount Plans
        </button>
      </div>

      {activeTab === 'accounts' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-96">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search organizations by name, email..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition font-medium"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 rounded-tl-xl">Organization</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Contact</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Credit Limit</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 rounded-tr-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingAccounts ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold uppercase">Loading Accounts...</td></tr>
                ) : filteredAccounts.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold uppercase">No corporate accounts found</td></tr>
                ) : (
                  filteredAccounts.map((account: any) => (
                    <tr key={account.id} className="hover:bg-gray-50/50 transition group">
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{account.company_name || 'N/A'}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-0.5"><MapPin size={12} className="mr-1"/> {account.address || 'No address'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-gray-700 flex items-center"><Mail size={14} className="mr-2 text-gray-400"/> {account.email || 'N/A'}</div>
                        <div className="text-sm font-medium text-gray-700 flex items-center mt-1"><Phone size={14} className="mr-2 text-gray-400"/> {account.phone || 'N/A'}</div>
                      </td>
                      <td className="p-4 font-black text-gray-900">
                        ₦{parseFloat(account.credit_limit || 0).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${account.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {account.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleEditAccount(account.id)} className="p-2 text-gray-400 hover:text-primary transition bg-white rounded-lg hover:shadow-sm border border-transparent hover:border-gray-200">
                          <Edit size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingPlans ? (
              <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase">Loading Plans...</div>
            ) : allPlans.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-400 font-bold uppercase bg-gray-50 rounded-xl border border-dashed border-gray-200">No Corporate Plans configured</div>
            ) : (
              allPlans.map((plan: any) => (
                <div key={plan.id} className="border border-gray-100 rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition group relative">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => handleEditPlan(plan.id)} className="p-1.5 text-gray-400 hover:text-primary bg-white rounded-lg shadow-sm border border-gray-100"><Edit size={14}/></button>
                    <button onClick={() => handleDeletePlan(plan.id)} className="p-1.5 text-gray-400 hover:text-red-500 bg-white rounded-lg shadow-sm border border-gray-100"><Trash2 size={14}/></button>
                  </div>
                  
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Award className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-2">{plan.description || 'No description provided'}</p>
                  
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-primary">
                      {plan.discount_type === 'percentage' 
                        ? `${parseFloat(plan.discount_percentage)}%` 
                        : `₦${parseFloat(plan.fixed_discount).toLocaleString()}`
                      }
                    </span>
                    <span className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-wider">Discount</span>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                     <span className={`text-xs font-bold px-2 py-1 rounded-md ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                        {plan.is_active ? 'ACTIVE' : 'INACTIVE'}
                     </span>
                     <span className="text-xs font-bold text-gray-400 uppercase">{corporateAccounts.filter((c:any) => c.corporate_plan_id === plan.id).length} Attached Orgs</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <CorporateAccountForm 
        isOpen={isAccountFormOpen}
        onClose={() => setIsAccountFormOpen(false)}
        customerId={editingAccountId}
      />
      <CorporatePlanForm 
        isOpen={isPlanFormOpen}
        onClose={() => setIsPlanFormOpen(false)}
        planId={editingPlanId}
      />
    </div>
  );
}
