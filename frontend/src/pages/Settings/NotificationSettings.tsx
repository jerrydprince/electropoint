import React, { useState } from 'react';
import { Bell, Smartphone, Mail, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    sms_invoices: true,
    sms_payments: true,
    sms_warranty: false,
    email_invoices: true,
    email_reports: true,
    alert_low_stock: true,
    alert_cash_variance: true
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    toast.success("Notification preferences saved successfully!");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Notification Configuration</h1>
          <p className="text-gray-500 mt-1">Manage Termii SMS, Emails, and In-App alerts.</p>
        </div>
        <button onClick={handleSave} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition shadow-lg flex items-center">
          <Save size={20} className="mr-2" /> Save Preferences
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* SMS Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center">
            <Smartphone className="text-gray-600 mr-2" size={24} />
            <h3 className="font-bold text-gray-900">Termii SMS Triggers</h3>
          </div>
          <div className="p-6 space-y-6">
            <ToggleOption 
              label="Invoice Generation" 
              description="Send SMS to customer when an invoice is created."
              checked={settings.sms_invoices} 
              onChange={() => handleToggle('sms_invoices')} 
            />
            <ToggleOption 
              label="Payment Receipts" 
              description="Send SMS confirmation for successful payments."
              checked={settings.sms_payments} 
              onChange={() => handleToggle('sms_payments')} 
            />
            <ToggleOption 
              label="Warranty Expiry" 
              description="Send SMS reminder 7 days before warranty expires."
              checked={settings.sms_warranty} 
              onChange={() => handleToggle('sms_warranty')} 
            />
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center">
            <Mail className="text-gray-600 mr-2" size={24} />
            <h3 className="font-bold text-gray-900">Email Triggers</h3>
          </div>
          <div className="p-6 space-y-6">
            <ToggleOption 
              label="Invoice PDF Attachment" 
              description="Email the generated Invoice PDF to the customer."
              checked={settings.email_invoices} 
              onChange={() => handleToggle('email_invoices')} 
            />
            <ToggleOption 
              label="Daily Reports" 
              description="Email daily sales summary to Admin."
              checked={settings.email_reports} 
              onChange={() => handleToggle('email_reports')} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleOption({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h4 className="font-bold text-gray-900">{label}</h4>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
      </label>
    </div>
  );
}
