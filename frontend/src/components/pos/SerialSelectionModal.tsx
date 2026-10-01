import React, { useState, useEffect } from 'react';
import { X, Search, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  requiredQuantity: number;
  selectedSerials: string[];
  onConfirm: (serials: string[]) => void;
}

export default function SerialSelectionModal({ isOpen, onClose, product, requiredQuantity, selectedSerials, onConfirm }: Props) {
  const [serials, setSerials] = useState<string[]>([]);
  const [scanInput, setScanInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSerials([...selectedSerials]);
      setScanInput('');
    }
  }, [isOpen, selectedSerials]);

  if (!isOpen || !product) return null;

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    const val = scanInput.trim();
    if (!val) return;

    if (serials.includes(val)) {
      toast.error('Serial number already scanned');
      return;
    }

    if (serials.length >= requiredQuantity) {
      toast.error(`You only need ${requiredQuantity} serials`);
      return;
    }
    
    // Validate against available serials
    const isAvailable = product.serials?.some((s: any) => s.serial_number === val);
    if (!isAvailable) {
      toast.error(`Serial ${val} is not available in inventory`);
      return;
    }

    setSerials([...serials, val]);
    setScanInput('');
  };

  const removeSerial = (s: string) => {
    setSerials(serials.filter(x => x !== s));
  };

  const handleSubmit = () => {
    if (serials.length !== requiredQuantity) {
      toast.error(`Please select exactly ${requiredQuantity} serial numbers.`);
      return;
    }
    onConfirm(serials);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900">Select Serial Numbers</h3>
            <p className="text-xs text-gray-500">{product.name} (Need {requiredQuantity})</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-200 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Scan or Select Serial Number</label>
            <form onSubmit={handleScan} className="flex gap-2">
              <input
                type="text"
                value={scanInput}
                onChange={e => setScanInput(e.target.value)}
                placeholder="Scan barcode..."
                className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                autoFocus
              />
              <button 
                type="submit"
                className="px-6 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition flex items-center"
              >
                <Barcode size={20} className="mr-2" /> Add
              </button>
            </form>
            {product.serials && product.serials.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Available Serials in Inventory:</p>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                  {product.serials.filter((s: any) => !serials.includes(s.serial_number)).map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (serials.length >= requiredQuantity) {
                          toast.error(`You only need ${requiredQuantity} serials`);
                          return;
                        }
                        setSerials([...serials, s.serial_number]);
                      }}
                      className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-mono hover:border-primary hover:text-primary transition"
                    >
                      {s.serial_number}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="border border-gray-200 rounded-lg h-48 overflow-y-auto bg-gray-50 p-2 space-y-2">
            {serials.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No serials scanned yet</div>
            ) : (
              serials.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded-md shadow-sm">
                  <span className="font-mono text-sm font-bold text-gray-800">{s}</span>
                  <button onClick={() => removeSerial(s)} className="text-red-500 hover:bg-red-50 p-1 rounded transition"><X size={14}/></button>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-4 flex justify-between items-center pt-2">
            <span className={`text-sm font-bold ${serials.length === requiredQuantity ? 'text-green-600' : 'text-orange-500'}`}>
              {serials.length} / {requiredQuantity} Scanned
            </span>
            <button 
              onClick={handleSubmit} 
              disabled={serials.length !== requiredQuantity}
              className="px-6 py-2 bg-primary text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
