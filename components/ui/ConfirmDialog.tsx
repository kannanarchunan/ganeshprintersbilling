import React from 'react';
import Button from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" 
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal Content */}
      <div className="bg-white rounded-2xl p-5 w-full max-w-sm border border-slate-100 shadow-2xl relative z-10 animate-scale-up">
        <h3 className="text-base font-bold text-slate-800 leading-snug">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          {description}
        </p>
        
        <div className="flex gap-2.5 mt-5 justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="rounded-xl text-xs h-9"
          >
            {cancelText}
          </Button>
          <Button 
            variant="danger" 
            size="sm" 
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl text-xs h-9"
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
