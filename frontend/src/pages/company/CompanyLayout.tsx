import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Building2, MapPin, Warehouse } from 'lucide-react';

const CompanyLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Profile', path: '/company', icon: Building2, exact: true },
    { name: 'Branches', path: '/company/branches', icon: MapPin },
    { name: 'Warehouses', path: '/company/warehouses', icon: Warehouse },
  ];

  return (
    <div className="flex flex-col min-h-full bg-gray-50/50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="px-6 py-3 overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? location.pathname === item.path 
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-2.5 rounded-sm text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-secondary text-white shadow-sm border border-secondary/20'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full relative">
        <Outlet />
      </div>
    </div>
  );
};

export default CompanyLayout;
