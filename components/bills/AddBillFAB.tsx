'use client';

import { Plus } from 'lucide-react';

interface AddBillFABProps {
  onClick: () => void;
}

export default function AddBillFAB({ onClick }: AddBillFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-6 z-30 w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-[0_4px_16px_rgba(22,163,74,0.3)] active:scale-90 active:bg-primary-800 transition-all select-none focus:outline-none"
      id="btn-add-bill"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
