import React, { useState } from 'react';
import Dashboard from './Dashboard';
import StockList from './StockList';
import Transfers from './Transfers';
import Movements from './Movements';
import Serials from './Serials';
import Valuation from './Valuation';
import { LayoutDashboard, List, ArrowRightLeft, History, Hash, DollarSign } from 'lucide-react';

export default function InventoryManager() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stock', label: 'Stock List', icon: List },
    { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
    { id: 'movements', label: 'Movements', icon: History },
    { id: 'valuation', label: 'Valuation', icon: DollarSign },
    { id: 'serials', label: 'Serials', icon: Hash },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b px-6 pt-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-4">Inventory Management</h1>
        <div className="flex space-x-1 overflow-x-auto pb-[-1px]">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'stock' && <StockList />}
        {activeTab === 'transfers' && <Transfers />}
        {activeTab === 'movements' && <Movements />}
        {activeTab === 'valuation' && <Valuation />}
        {activeTab === 'serials' && <Serials />}
      </div>
    </div>
  );
}
