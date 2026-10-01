import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface PermissionRouteProps {
  children: ReactNode;
  permission: string | string[];
}

export const PermissionRoute = ({ children, permission }: PermissionRouteProps) => {
  const { hasPermission, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = permissions.some(perm => hasPermission(perm));

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-gray-50/50 p-6 animate-fade-in">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Access Denied</h2>
          <p className="text-gray-500 mb-8">
            You do not have the required permissions to access this page. Please contact your system administrator if you believe this is an error.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
