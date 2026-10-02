import React, { useState, useMemo, useEffect } from 'react';
import { Search, ShoppingCart, User, Plus, Trash2, PauseCircle, PlayCircle, X, ShieldCheck, ChevronRight } from 'lucide-react';
import { usePosProducts } from '../../hooks/usePos';
import { useCustomers } from '../../hooks/useCustomers';
import CheckoutModal from '../../components/pos/CheckoutModal';
import SerialSelectionModal from '../../components/pos/SerialSelectionModal';
import CustomerQuickAddModal from '../../components/customers/CustomerQuickAddModal';
import DocumentModal from '../../components/documents/DocumentModal';
import toast from 'react-hot-toast';

export default function POSManager() {
  // Queries
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data: productsData, isLoading: loadingProducts } = usePosProducts({ q: debouncedQuery });
  const { data: customersData } = useCustomers(); 

  const products = Array.isArray(productsData) ? productsData : productsData?.data || [];
  const customers = Array.isArray(customersData) ? customersData : customersData?.data || [];

  // State
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Modals
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCustomerAdd, setShowCustomerAdd] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);
  
  const [activeSerialProduct, setActiveSerialProduct] = useState<any>(null);
  const [showSerialModal, setShowSerialModal] = useState(false);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Cart Functions
  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      updateQuantity(product.id, existing.cartQty + 1);
    } else {
      const newItem = { ...product, cartQty: 1, cartDiscount: 0, selectedSerials: [] };
      setCart([...cart, newItem]);
      
      // Prompt for serials immediately if required
      if (product.serial_tracking) {
        setActiveSerialProduct(newItem);
        setShowSerialModal(true);
      }
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, qty: number) => {
    if (qty < 1) return;
    setCart(cart.map(item => {
      if (item.id === id) {
        const newItem = { ...item, cartQty: qty };
        if (item.serial_tracking && newItem.selectedSerials.length !== qty) {
           setActiveSerialProduct(newItem);
           setShowSerialModal(true);
        }
        return newItem;
      }
      return item;
    }));
  };

  const setDiscount = (id: number, discount: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, cartDiscount: discount } : item));
  };

  const handleSerialConfirm = (serials: string[]) => {
    setCart(cart.map(item => item.id === activeSerialProduct.id ? { ...item, selectedSerials: serials } : item));
    setShowSerialModal(false);
    setActiveSerialProduct(null);
  };

  const holdTransaction = () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    const held = { cart, selectedCustomer, time: new Date().toISOString() };
    localStorage.setItem('held_pos_transaction', JSON.stringify(held));
    setCart([]);
    setSelectedCustomer(null);
    toast.success("Transaction held successfully");
  };

  const resumeTransaction = () => {
    const held = localStorage.getItem('held_pos_transaction');
    if (!held) return toast.error("No held transaction found");
    const parsed = JSON.parse(held);
    setCart(parsed.cart);
    setSelectedCustomer(parsed.selectedCustomer);
    localStorage.removeItem('held_pos_transaction');
    toast.success("Transaction resumed");
  };

  const cancelTransaction = () => {
    if (window.confirm("Are you sure you want to clear the cart?")) {
      setCart([]);
      setSelectedCustomer(null);
    }
  };

  // Calculations
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + (parseFloat(item.selling_price) * item.cartQty), 0), [cart]);
  
  const totalDiscount = useMemo(() => {
    let manualDiscount = cart.reduce((sum, item) => sum + (parseFloat(item.cartDiscount) || 0), 0);
    let corporateDiscount = 0;

    // Resolve Corporate Plan (Direct or via Corporate Account)
    const plan = selectedCustomer?.corporate_plan || selectedCustomer?.corporate_account?.corporate_plan;
    
    if (plan && plan.is_active) {
      if (plan.discount_type === 'percentage') {
        corporateDiscount = subtotal * (parseFloat(plan.discount_percentage) / 100);
      } else if (plan.discount_type === 'fixed') {
        corporateDiscount = parseFloat(plan.fixed_discount) || 0;
      }
    }

    return manualDiscount + corporateDiscount;
  }, [cart, selectedCustomer, subtotal]);

  const tax = (subtotal - totalDiscount) * 0.075; // 7.5% Tax
  const grandTotal = subtotal - totalDiscount + tax;

  const handleCheckoutSuccess = (saleData: any) => {
    setCart([]);
    setSelectedCustomer(null);
    setShowCheckout(false);
    setCompletedSale(saleData);
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50 overflow-hidden font-sans">
      
      {/* LEFT: Products Pane (70%) */}
      <div className="w-[70%] flex flex-col border-r border-gray-200 bg-white no-print">
        {/* Search Bar Header */}
        <div className="p-4 border-b border-gray-100 flex gap-4 items-center bg-white shrink-0">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search barcode, SKU, or product name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium transition-all"
            />
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center">
            {products.length} Products Found
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
          {loadingProducts ? (
            <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest">Loading Inventory...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-bold uppercase tracking-widest">No Products Found</div>
          ) : (
            <div className="grid grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {products.map((p: any) => (
                <button 
                  key={p.id} 
                  onClick={() => addToCart(p)}
                  className="bg-white p-3 rounded-sm shadow-sm border border-gray-200 hover:border-primary hover:shadow-md transition text-left flex flex-col h-44 relative group focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {p.serial_tracking && (
                    <div className="absolute top-2 right-2 text-blue-500 z-10"><ShieldCheck size={16} /></div>
                  )}
                  <div className="w-full h-20 mb-2 flex-shrink-0 bg-gray-50 overflow-hidden flex items-center justify-center">
                    {p.image ? (
                      <img src={p.image.startsWith('http') ? p.image : `${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${p.image}`} alt={p.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <ShoppingCart size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 truncate">{p.category?.name || 'Uncategorized'}</div>
                  <div className="text-sm font-bold text-gray-900 leading-tight flex-1 line-clamp-2">{p.name}</div>
                  <div className="flex justify-between items-end mt-auto pt-2 border-t border-gray-50">
                    <div className="text-primary font-black text-sm">₦{parseFloat(p.selling_price).toLocaleString()}</div>
                    <div className="text-[10px] font-bold text-gray-400">{p.quantity} In Stock</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Cart & Checkout Pane (30%) - DARK MODE */}
      <div className="w-[30%] flex flex-col bg-gray-900 text-gray-100 shadow-2xl z-10 relative no-print">
        
        {/* Customer Selector */}
        <div className="p-4 border-b border-gray-800 bg-black shrink-0">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center">
              <User size={12} className="mr-1"/> Attached Customer
            </h3>
            <button onClick={() => setShowCustomerAdd(true)} className="text-primary hover:text-white transition"><Plus size={16}/></button>
          </div>
          <select 
            value={selectedCustomer?.id || ''} 
            onChange={e => {
              const c = customers.find((x: any) => x.id === parseInt(e.target.value));
              setSelectedCustomer(c || null);
            }}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-sm p-2 outline-none appearance-none font-bold text-sm hover:border-gray-600 transition"
          >
            <option value="">WALK-IN CUSTOMER</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
            ))}
          </select>
        </div>

        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center shrink-0">
          <h2 className="font-black text-white uppercase tracking-wider text-sm">Order Items</h2>
          <span className="bg-primary/20 text-primary border border-primary/30 text-xs font-bold px-2 py-0.5 rounded-sm">{cart.length}</span>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-gray-900">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-700">
              <ShoppingCart size={48} className="mb-4 opacity-50" />
              <p className="font-bold uppercase tracking-wider text-sm">Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.map(item => (
                <div key={item.id} className="bg-gray-800 border border-gray-700 rounded-sm p-3 hover:border-gray-600 transition group flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 pr-2">
                      <div className="font-bold text-sm text-white line-clamp-1">{item.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{item.sku}</div>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-500 hover:text-red-400 transition"><Trash2 size={16}/></button>
                  </div>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center border border-gray-700 rounded-sm overflow-hidden h-7 bg-gray-900">
                      <button onClick={() => updateQuantity(item.id, item.cartQty - 1)} className="px-2 hover:bg-gray-700 text-gray-400 hover:text-white font-bold transition">-</button>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.cartQty} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)} 
                        className="w-10 text-center text-sm font-bold bg-gray-900 text-white border-x border-gray-700 focus:outline-none appearance-none" 
                      />
                      <button onClick={() => updateQuantity(item.id, item.cartQty + 1)} className="px-2 hover:bg-gray-700 text-gray-400 hover:text-white font-bold transition">+</button>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-white">₦{((parseFloat(item.selling_price) * item.cartQty) - (item.cartDiscount||0)).toLocaleString()}</div>
                    </div>
                  </div>

                  {item.serial_tracking && (
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-700 flex justify-between items-center">
                       <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center ${item.selectedSerials?.length === item.cartQty ? 'text-green-400' : 'text-orange-400'}`}>
                         <ShieldCheck size={12} className="mr-1"/> Serials: {item.selectedSerials?.length || 0}/{item.cartQty}
                       </span>
                       <button onClick={() => { setActiveSerialProduct(item); setShowSerialModal(true); }} className="text-[10px] bg-gray-700 text-white px-2 py-1 rounded-sm hover:bg-gray-600 font-bold uppercase transition">Configure</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-2 bg-gray-900 border-t border-gray-800 grid grid-cols-3 gap-1 shrink-0">
          <button onClick={holdTransaction} className="flex flex-col items-center justify-center py-2 rounded-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition text-[10px] uppercase font-bold tracking-wider">
            <PauseCircle size={16} className="mb-1" /> Hold
          </button>
          <button onClick={resumeTransaction} className="flex flex-col items-center justify-center py-2 rounded-sm bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 transition text-[10px] uppercase font-bold tracking-wider">
            <PlayCircle size={16} className="mb-1" /> Resume
          </button>
          <button onClick={cancelTransaction} className="flex flex-col items-center justify-center py-2 rounded-sm bg-gray-800 hover:bg-red-900/50 border border-gray-700 hover:border-red-800 text-red-400 transition text-[10px] uppercase font-bold tracking-wider">
            <X size={16} className="mb-1" /> Clear
          </button>
        </div>

        {/* Totals & Checkout */}
        <div className="bg-black border-t border-gray-800 shrink-0">
          <div className="p-4 space-y-2 text-xs font-bold uppercase tracking-wider border-b border-gray-900">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span className="text-gray-300">₦{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Discount</span>
              <span className="text-red-400">-₦{totalDiscount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax (7.5%)</span>
              <span className="text-gray-300">₦{tax.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Due</span>
              <span className="text-3xl font-black text-white tracking-tight">₦{grandTotal.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => {
                if (cart.length === 0) return toast.error("Cart is empty");
                const missingSerials = cart.find(i => i.serial_tracking && i.selectedSerials?.length !== i.cartQty);
                if (missingSerials) return toast.error(`Please select serials for ${missingSerials.name}`);
                setShowCheckout(true);
              }}
              disabled={cart.length === 0}
              className="w-full py-4 bg-primary text-white text-lg font-black uppercase tracking-wider rounded-sm hover:bg-red-700 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pay Now <ChevronRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CheckoutModal 
        isOpen={showCheckout} 
        onClose={() => setShowCheckout(false)} 
        cart={cart}
        customer={selectedCustomer}
        subtotal={subtotal}
        discount={totalDiscount}
        tax={tax}
        grandTotal={grandTotal}
        onSuccess={handleCheckoutSuccess}
      />

      <CustomerQuickAddModal 
        isOpen={showCustomerAdd} 
        onClose={() => setShowCustomerAdd(false)} 
        onSuccess={(customer) => {
          setSelectedCustomer(customer);
          setShowCustomerAdd(false);
        }}
      />

      <DocumentModal 
        isOpen={!!completedSale} 
        onClose={() => setCompletedSale(null)} 
        sale={completedSale} 
        autoPrint={true}
      />

      {activeSerialProduct && (
        <SerialSelectionModal
          isOpen={showSerialModal}
          onClose={() => {
            setShowSerialModal(false);
            setActiveSerialProduct(null);
          }}
          product={activeSerialProduct}
          requiredQuantity={activeSerialProduct.cartQty}
          onConfirm={handleSerialConfirm}
          selectedSerials={activeSerialProduct.selectedSerials || []}
        />
      )}
    </div>
  );
}
