import React, { useState } from 'react';
import Requisitions from './Requisitions';
import PurchaseOrders from './PurchaseOrders';
import GoodsReceiving from './GoodsReceiving';
import { FileText, ShoppingCart, Truck } from 'lucide-react';

export default function ProcurementManager() {
  const [activeTab, setActiveTab] = useState('requisitions');

  const tabs = [
    { id: 'requisitions', label: 'Purchase Requisitions', icon: FileText },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'goods-receiving', label: 'Goods Receiving', icon: Truck },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col relative pb-20">
      {/* Header and Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 pt-6 shrink-0 sticky top-0 z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Procurement</h1>
        <p className="text-gray-500 mt-1 mb-6 text-sm">Manage requisitions and purchase orders</p>
        
        <div className="flex space-x-1 overflow-x-auto hide-scrollbar">
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
                <Icon size={18} className="mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'requisitions' && <Requisitions />}
        {activeTab === 'purchase-orders' && <PurchaseOrders />}
        {activeTab === 'goods-receiving' && <GoodsReceiving />}
      </div>
    </div>
  );
}
