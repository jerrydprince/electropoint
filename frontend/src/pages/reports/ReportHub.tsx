import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LineChart, Package, DollarSign, FileText } from 'lucide-react';

export default function ReportHub() {
  const location = useLocation();

  const links = [
    { path: '/reports/sales', label: 'Sales Reports', icon: <LineChart size={20} /> },
    { path: '/reports/inventory', label: 'Inventory Reports', icon: <Package size={20} /> },
    { path: '/finance/reports', label: 'Financial Reports', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar for Reports */}
      <div className="w-64 bg-white border-r border-gray-100 flex flex-col pt-8">
        <div className="px-6 mb-8">
          <Link to="/reports" className="text-xl font-black text-gray-900 flex items-center hover:text-primary transition-colors">
            <FileText size={24} className="mr-2 text-primary" /> Reports Hub
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Report Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        <Outlet />
      </div>
    </div>
  );
}
