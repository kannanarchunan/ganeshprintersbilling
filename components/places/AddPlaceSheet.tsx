'use client';

import React, { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import Button from '../ui/Button';

interface AddPlaceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
  isLoading?: boolean;
}

export default function AddPlaceSheet({
  isOpen,
  onClose,
  onAdd,
  isLoading = false,
}: AddPlaceSheetProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Location name must be at least 2 characters.');
      return;
    }

    try {
      await onAdd(trimmedName);
      setName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add place. Make sure name is unique.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      
      {/* Slide-Up Container */}
      <div className="bg-white rounded-t-3xl p-5 w-full max-w-md border-t border-slate-100 shadow-2xl relative z-10 animate-slide-up pb-[calc(env(safe-area-inset-bottom,16px)+16px)]">
        {/* Notch/Grabber */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4" />

        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 border border-primary-100/50">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Add Delivery Place</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Organize bills under locations</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-50 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="place-name" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Location / Place Name
            </label>
            <input
              id="place-name"
              type="text"
              placeholder="e.g. Hyderabad Printers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full bg-slate-50 border border-slate-200 focus:border-primary-400 focus:bg-white rounded-2xl px-4 py-3 text-xs font-semibold focus:outline-none transition-all"
              autoFocus
              required
            />
            {error && <p className="text-[10px] text-red-600 font-semibold mt-1">{error}</p>}
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl text-xs h-10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 rounded-xl text-xs h-10"
            >
              {isLoading ? 'Creating...' : 'Add Location'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
