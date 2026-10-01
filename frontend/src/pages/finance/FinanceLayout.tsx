import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Banknote, 
  Wallet, 
  FileText, 
  Calculator, 
  BarChart, 
  TrendingUp, 
  Landmark, 
  CheckCircle,
  CalendarDays
} from 'lucide-react';

const FinanceLayout = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/finance', icon: LayoutDashboard, exact: true },
    { name: 'Cash Register', path: '/cash-register', icon: Banknote },
    { name: 'Expenses', path: '/finance/expenses', icon: Wallet },
    { name: 'Ledger', path: '/finance/ledger', icon: CheckCircle },
    { name: 'Journals', path: '/finance/journals', icon: FileText },
    { name: 'Chart of Accounts', path: '/finance/chart-of-accounts', icon: Landmark },
    { name: 'Taxes', path: '/finance/taxes', icon: Calculator },
    { name: 'Budgets', path: '/finance/budgets', icon: BarChart },
    { name: 'Periods', path: '/finance/periods', icon: CalendarDays },
    { name: 'Reports', path: '/finance/reports', icon: FileText },
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
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
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
      <div className="flex-1 w-full max-w-full relative">
        <Outlet />
      </div>
    </div>
  );
};

export default FinanceLayout;
