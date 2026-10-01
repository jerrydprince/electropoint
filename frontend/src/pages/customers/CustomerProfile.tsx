import React, { useState } from 'react';
import { useCustomer } from '../../hooks/useCustomers';
import { useParams, Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, Briefcase, CreditCard, ShoppingBag, ShieldCheck, Award, FileText, ArrowLeft, RefreshCcw } from 'lucide-react';

export default function CustomerProfile() {
  const { id } = useParams();
  const { data: customer, isLoading } = useCustomer(id);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) return <div className="text-center py-8">Loading profile...</div>;
  if (!customer) return <div className="text-center py-8">Customer not found</div>;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'purchases', name: 'Purchases', icon: ShoppingBag },
    { id: 'products', name: 'Products Owned', icon: ShieldCheck },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'credit', name: 'Credit Ledger', icon: FileText },
    { id: 'returns', name: 'Returns', icon: RefreshCcw },
    { id: 'warranties', name: 'Warranties', icon: ShieldCheck },
    { id: 'loyalty', name: 'Loyalty Points', icon: Award },
    { id: 'statements', name: 'Statements', icon: FileText },
  ];

  return (
    <div className="p-8 animate-fade-in w-full mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/customers" className="mr-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              {customer.title ? `${customer.title} ` : ''}{customer.first_name} {customer.last_name}
              <span className="ml-3 px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium border border-gray-200">
                {customer.customer_code}
              </span>
            </h1>
            <p className="text-gray-500 mt-1">{customer.company_name || 'Individual Customer'}</p>
          </div>
        </div>
        <div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {customer.status}
          </span>
          <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase tracking-wider">
            {customer.customer_type}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center px-4 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className="mr-2" />
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 space-y-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Phone className="text-gray-400 mr-3 mt-0.5" size={18} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.phone || 'No phone'}</div>
                      <div className="text-xs text-gray-500">Mobile</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="text-gray-400 mr-3 mt-0.5" size={18} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.email || 'No email'}</div>
                      <div className="text-xs text-gray-500">Email Address</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="text-gray-400 mr-3 mt-0.5" size={18} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.address || 'No address provided'}</div>
                      <div className="text-xs text-gray-500">Physical Address</div>
                    </div>
                  </div>
                  {customer.company_name && (
                    <div className="flex items-start">
                      <Briefcase className="text-gray-400 mr-3 mt-0.5" size={18} />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.company_name}</div>
                        <div className="text-xs text-gray-500">Company</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                  <h4 className="text-green-800 text-sm font-bold mb-1">Credit Limit</h4>
                  <div className="text-2xl font-black text-green-900">₦{parseFloat(customer.credit_limit).toLocaleString()}</div>
                </div>
                <div className="bg-purple-50 p-5 rounded-xl border border-purple-100">
                  <h4 className="text-purple-800 text-sm font-bold mb-1">Loyalty Points</h4>
                  <div className="text-2xl font-black text-purple-900 flex items-center">
                    <Award className="mr-2" /> {customer.loyalty_points}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 uppercase tracking-wider text-xs">Internal Notes</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{customer.notes || 'No notes available.'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Future Tabs (Data depends on Session 12 Sales Module) */}
        {activeTab !== 'overview' && (
          <div className="h-[400px] flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">{activeTab} Module</h3>
            <p className="text-gray-500 max-w-md">
              Data for {activeTab} will be fully available and populated once the POS & Sales engine (Session 12) is deployed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
