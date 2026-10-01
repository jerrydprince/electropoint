import React, { useState, useEffect } from 'react';
import { Bell, PackageX, AlertTriangle, CreditCard, Clock, CheckCircle, Loader } from 'lucide-react';
import api from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data || []);
    } catch (error: any) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/mark-read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (error) {
      // Handle silently for individual reads
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'out_of_stock': return <PackageX className="text-red-500" />;
      case 'low_stock': return <AlertTriangle className="text-orange-500" />;
      case 'payment': return <CreditCard className="text-green-500" />;
      case 'warranty': return <Clock className="text-blue-500" />;
      default: return <Bell className="text-gray-500" />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notification Center</h1>
          <p className="text-gray-500 mt-1">Stay updated on inventory alerts and system events.</p>
        </div>
        <button onClick={markAllAsRead} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition shadow-sm flex items-center">
          <CheckCircle size={18} className="mr-2" /> Mark All as Read
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-medium text-lg">You're all caught up!</p>
            <p className="text-sm">No new notifications to display.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {notifications.map((n) => (
              <li 
                key={n.id} 
                onClick={() => !n.read_at && markAsRead(n.id)}
                className={`p-4 hover:bg-gray-50 transition flex items-start cursor-pointer ${!n.read_at ? 'bg-blue-50/30' : ''}`}
              >
                <div className="p-3 bg-white border border-gray-100 rounded-xl mr-4 shrink-0 shadow-sm">
                  {getIcon(n.data?.type || 'info')}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-bold ${!n.read_at ? 'text-gray-900' : 'text-gray-700'}`}>{n.data?.title || 'Notification'}</h3>
                    <span className="text-xs text-gray-400 font-medium">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{n.data?.message}</p>
                </div>
                {!n.read_at && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 ml-4 shrink-0"></div>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
