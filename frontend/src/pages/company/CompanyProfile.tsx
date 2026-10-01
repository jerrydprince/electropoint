import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, MapPin, FileText, DollarSign, Save, Image as ImageIcon, Printer } from 'lucide-react';
import { useCompany, useUpdateCompany } from '../../hooks/useCompany';

export default function CompanyProfile() {
  const { data: company, isLoading } = useCompany();
  const updateCompany = useUpdateCompany();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    currency: 'USD',
  });
  
  const [receiptConfig, setReceiptConfig] = useState({
    header: '',
    footer: '',
    paper_size: '80mm',
  });
  
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        email: company.email || '',
        phone: company.phone || '',
        address: company.address || '',
        tax_number: company.tax_number || '',
        currency: company.currency || 'USD',
      });
      if (company.receipt_configuration) {
        setReceiptConfig({
          header: company.receipt_configuration.header || '',
          footer: company.receipt_configuration.footer || '',
          paper_size: company.receipt_configuration.paper_size || '80mm',
        });
      }
      if (company.logo) {
        setLogoPreview(company.logo.startsWith('http') ? company.logo : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${company.logo}`);
      }
    }
  }, [company]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setReceiptConfig({ ...receiptConfig, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      Object.entries(receiptConfig).forEach(([key, value]) => {
        payload.append(`receipt_configuration[${key}]`, value as string);
      });
      if (logoFile) {
        payload.append('logo', logoFile);
      }
      
      await updateCompany.mutateAsync(payload);
      setSuccessMsg('Company profile updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'An error occurred.');
    }
  };

  return (
    <div className="p-6 w-full mx-auto animate-fade-in pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Profile</h1>
        <p className="text-gray-500 mt-1">Manage your organization's core information and branding</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border-l-4 border-primary p-4 rounded-r-xl mb-6 shadow-sm flex items-start">
          <div className="ml-3 text-red-800 text-sm font-medium">{errorMsg}</div>
        </div>
      )}
      
      {successMsg && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-xl mb-6 shadow-sm flex items-start">
          <div className="ml-3 text-green-800 text-sm font-medium">{successMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <ImageIcon size={20} className="text-primary mr-2" />
              Company Branding
            </h2>
          </div>
          <div className="p-6 md:p-8 flex items-center gap-8">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 relative group cursor-pointer">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-xs">Upload Logo</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">Change</span>
              </div>
              <input type="file" name="logo" accept="image/*" onChange={handleLogoChange} className="absolute inset-0 opacity-0 cursor-pointer" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 mb-1">Company Logo</h3>
              <p className="text-sm text-gray-500 mb-4">Upload a high-res image. Recommended size: 256x256px.</p>
              <button type="button" onClick={() => { setLogoFile(null); setLogoPreview(null); }} className="text-sm text-red-600 hover:text-red-700 font-medium">
                Remove Logo
              </button>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Building2 size={20} className="text-primary mr-2" />
              Business Details
            </h2>
          </div>
          
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tax Number (VAT/TIN)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="tax_number" value={formData.tax_number} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Base Currency</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <select name="currency" value={formData.currency} onChange={handleChange} className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm appearance-none bg-white">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="NGN">NGN (₦)</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Physical Address</label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea name="address" rows={3} value={formData.address} onChange={handleChange} className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Configuration Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Printer size={20} className="text-primary mr-2" />
              Receipt Configuration
            </h2>
          </div>
          
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Receipt Header Text</label>
              <textarea name="header" rows={3} value={receiptConfig.header} onChange={handleReceiptChange} placeholder="e.g. Thanks for shopping with us!" className="block w-full p-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Receipt Footer Text</label>
              <textarea name="footer" rows={3} value={receiptConfig.footer} onChange={handleReceiptChange} placeholder="e.g. Return within 30 days." className="block w-full p-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm"></textarea>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Printer Paper Size</label>
              <select name="paper_size" value={receiptConfig.paper_size} onChange={handleReceiptChange} className="block w-full p-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors sm:text-sm bg-white">
                <option value="58mm">58mm Thermal</option>
                <option value="80mm">80mm Thermal</option>
                <option value="A4">A4 Standard</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={updateCompany.isPending} className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-logo-red to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-red-500/30 disabled:opacity-70">
            <Save size={18} className="mr-2" />
            Save Company Profile
          </button>
        </div>
      </form>
    </div>
  );
}
