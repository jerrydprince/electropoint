import React, { useState } from 'react';
import { Package, BookOpen, Warehouse, ClipboardList, CheckSquare } from 'lucide-react';
import SupplyCatalog from './SupplyCatalog';
import SupplyStock from './SupplyStock';
import SupplyRequests from './SupplyRequests';
import SupplyApprovals from './SupplyApprovals';

export default function SuppliesManager() {
  const [activeTab, setActiveTab] = useState('catalog');

  const tabs = [
    { id: 'catalog', name: 'Supply Catalog', icon: BookOpen },
    { id: 'stock', name: 'Stock & Receiving', icon: Warehouse },
    { id: 'requests', name: 'My Requests', icon: ClipboardList },
    { id: 'approvals', name: 'Approvals & Issues', icon: CheckSquare },
  ];

  return (
    <div className="p-8 animate-fade-in w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Package className="mr-3 text-primary" size={32} />
          Operational Supplies
        </h1>
        <p className="text-gray-500 mt-2">Manage internal consumables, stationery, and operational materials.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-8 inline-flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-6 py-2.5 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-red-50 text-primary'
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
        {activeTab === 'catalog' && <SupplyCatalog />}
        {activeTab === 'stock' && <SupplyStock />}
        {activeTab === 'requests' && <SupplyRequests />}
        {activeTab === 'approvals' && <SupplyApprovals />}
      </div>
    </div>
  );
}
