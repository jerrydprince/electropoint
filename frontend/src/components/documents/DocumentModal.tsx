import React from 'react';
import { X } from 'lucide-react';
import DocumentViewer from './DocumentViewer';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  autoPrint?: boolean;
}

export default function DocumentModal({ isOpen, onClose, sale, autoPrint = false }: Props) {
  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-sm print:static print:bg-transparent print:backdrop-blur-none animate-fade-in print:block">
      <div className="bg-gray-100 w-full max-w-5xl h-[90vh] md:h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative print:h-auto print:rounded-none print:shadow-none print:overflow-visible print:block">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-50 p-2 bg-white text-gray-500 hover:text-gray-900 rounded-full hover:bg-gray-200 shadow-md transition print:hidden"
        >
          <X size={20} />
        </button>

        <DocumentViewer sale={sale} autoPrint={autoPrint} />

      </div>
    </div>
  );
}
