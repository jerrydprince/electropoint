import React, { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Truck, Users, DollarSign, LogOut, ShoppingBag, ChevronDown, Building2, RotateCcw, CreditCard, Shield, Calculator, FileText, BarChart3, Bell, History, Server, Tag, Ruler, Briefcase, MapPin, Warehouse, UserCog, ArrowLeft, Banknote } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GlobalSearch from './GlobalSearch';
import { syncOfflineTransactions, getOfflineQueue } from '../../services/offlineSync';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';


const NavItem = ({ to, icon: Icon, children }: { to: string, icon: any, children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');
  
  return (
    <li>
      <NavLink 
        to={to} 
        className={() => 
          `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
            isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-sidebar-hover hover:text-white'
          }`
        }
      >
        <Icon size={18} className={`mr-3 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary'}`} />
        {children}
      </NavLink>
    </li>
  );
};

const NavSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <>
      <li className="pt-4 mt-4 border-t border-white/10">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="w-full flex justify-between items-center px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors cursor-pointer"
        >
          {title}
          <ChevronDown size={14} className={`transform transition-transform ${isOpen ? '' : '-rotate-90'}`} />
        </button>
      </li>
      {isOpen ? children : null}
    </>
  );
};
export default function AppShell() {
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  React.useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      const queue = await getOfflineQueue();
      if (queue.length > 0) {
        setIsSyncing(true);
        const res = await syncOfflineTransactions();
        setIsSyncing(false);
        if (res.success) {
          toast.success(`Successfully synced ${res.count} offline transactions!`);
          setOfflineCount(0);
        } else {
          toast.error("Failed to sync offline transactions.");
        }
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    getOfflineQueue().then(q => setOfflineCount(q.length));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Dynamic Dashboard Routing
  const getDashboardRoute = () => {
    if (!user) return '/';
    const roleName = user.roles?.[0]?.name || '';
    if (roleName === 'Super Administrator' || roleName === 'Administrator' || roleName === 'Manager') return '/dashboards/admin';
    if (roleName === 'Branch Manager') return '/dashboards/branch';
    return '/dashboards/cashier';
  };

  return (
    <div className="flex h-screen bg-gray-50 print:h-auto print:block">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-white flex flex-col shadow-2xl relative z-10 shrink-0 print:hidden">
        <div className="h-16 flex items-center justify-center border-b border-white/10 shrink-0 bg-logo-red">
          <img src="/logo.png" alt="Electropoint" className="h-8 object-contain" />
        </div>
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col custom-scrollbar">
          <ul className="flex-1 px-3 py-6 space-y-1">
            <NavItem to={getDashboardRoute()} icon={LayoutDashboard}>Dashboard</NavItem>
            {hasPermission('sales.create') && <NavItem to="/sales" icon={ShoppingCart}>Sales (POS)</NavItem>}
            {hasPermission('sales.create') && <NavItem to="/cash-register" icon={Banknote}>Cash Register</NavItem>}
            {hasPermission('sales.view') && <NavItem to="/sales-history" icon={History}>Sales History</NavItem>}
            
            {(hasPermission('products.view') || hasPermission('inventory.view')) && (
              <NavSection title="Inventory Engine">
                {hasPermission('products.view') && <NavItem to="/products" icon={ShoppingBag}>Products Catalog</NavItem>}
                {hasPermission('inventory.view') && <NavItem to="/inventory" icon={Server}>Inventory Core</NavItem>}
              </NavSection>
            )}

            {(hasPermission('procurement.view') || hasPermission('customers.view')) && (
              <NavSection title="Commercial Operations">
                {hasPermission('procurement.view') && <NavItem to="/procurement" icon={Package}>Procurement</NavItem>}
                {hasPermission('procurement.view') && <NavItem to="/suppliers" icon={Truck}>Suppliers</NavItem>}
                {hasPermission('customers.view') && <NavItem to="/customers" icon={Users}>Customers</NavItem>}
                {hasPermission('customers.view') && <NavItem to="/corporate-accounts" icon={Briefcase}>Corporate Accounts</NavItem>}
              </NavSection>
            )}

            {(hasPermission('sales.refund') || hasPermission('inventory.transfer') || hasPermission('sales.view')) && (
              <NavSection title="Operations">
                {hasPermission('sales.refund') && <NavItem to="/returns" icon={RotateCcw}>Returns</NavItem>}
                {hasPermission('inventory.transfer') && <NavItem to="/supplies" icon={Package}>Internal Supplies</NavItem>}
                {hasPermission('sales.view') && <NavItem to="/warranties" icon={Shield}>Warranties</NavItem>}
              </NavSection>
            )}
            
            {hasPermission('finance.view') && (
              <NavSection title="Financial Engine">
                <NavItem to="/finance" icon={Calculator}>Finance</NavItem>
              </NavSection>
            )}
            
            {(hasPermission('settings.view') || hasPermission('users.view') || hasPermission('roles.view')) && (
              <NavSection title="Administration">
                {hasPermission('settings.view') && <NavItem to="/company" icon={Building2}>Company Profile</NavItem>}
                {hasPermission('users.view') && <NavItem to="/users" icon={Users}>Users</NavItem>}
                {hasPermission('roles.view') && <NavItem to="/roles" icon={UserCog}>Roles & Permissions</NavItem>}
              </NavSection>
            )}
          </ul>
          
          <div className="px-4 py-4 mt-auto border-t border-white/10">
            <button 
              onClick={() => logout()}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut size={18} className="mr-3" />
              Sign Out
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible print:block">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0 z-0 print:hidden">
          <div className="flex-1">
             <GlobalSearch />
          </div>
          
          <div className="flex items-center space-x-6 pl-4">
            
            {/* Sync Status Indicator */}
            <div className="flex items-center px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 shadow-inner">
              {isSyncing ? (
                <div className="flex items-center text-blue-500 text-xs font-bold"><RefreshCw size={14} className="mr-2 animate-spin" /> Syncing...</div>
              ) : isOnline ? (
                <div className="flex items-center text-green-500 text-xs font-bold"><Wifi size={14} className="mr-2" /> Online {offlineCount > 0 && `(${offlineCount} pending)`}</div>
              ) : (
                <div className="flex items-center text-red-500 text-xs font-bold"><WifiOff size={14} className="mr-2" /> Offline ({offlineCount} queued)</div>
              )}
            </div>

            <Link to="/notifications" className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
            </Link>
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-bold text-gray-900">{user?.name}</span>
              <span className="text-xs text-gray-500">{user?.roles?.[0]?.name}</span>
            </div>
            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold shadow-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50 print:overflow-visible print:bg-white">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
