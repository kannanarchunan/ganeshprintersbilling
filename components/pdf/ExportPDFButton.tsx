'use client';

import React, { useState } from 'react';
import { FileDown, CheckCircle2 } from 'lucide-react';
import { Bill } from '@/types';
import { generatePendingBillsPDF } from '@/lib/pdf/generatePDF';
import Button from '../ui/Button';
import { useToast } from '../ui/ToastProvider';
import { useLanguage } from '@/components/ui/LanguageProvider';

interface ExportPDFButtonProps {
  placeName: string;
  bills: Bill[];
  label?: string;
}

export default function ExportPDFButton({
  placeName,
  bills,
  label = 'Download Pending Bills PDF',
}: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleExport = () => {
    if (!bills || bills.length === 0) {
      toast(t.language === 'ta' ? 'ஏற்றுமதி செய்ய பில்கள் எதுவும் இல்லை.' : 'No invoices available for export.', 'error');
      return;
    }

    setIsExporting(true);
    
    // Slight timeout to give mobile browser main-loop cooling
    setTimeout(() => {
      const success = generatePendingBillsPDF(placeName, bills);
      setIsExporting(false);
      
      if (success) {
        toast(t.language === 'ta' ? 'PDF அறிக்கை வெற்றிகரமாக பதிவிறக்கப்பட்டது!' : 'PDF statement downloaded successfully!', 'success');
      } else {
        toast(t.language === 'ta' ? 'PDF அறிக்கை தயாரிப்பதில் தோல்வி. மீண்டும் முயற்சிக்கவும்.' : 'Failed to compile PDF statement. Please try again.', 'error');
      }
    }, 300);
  };

  const getLabel = () => {
    if (label === 'Download Pending Bills PDF') {
      return t.language === 'ta' ? 'நிலுவை பில்கள் PDF பதிவிறக்குக' : 'Download Pending Bills PDF';
    }
    return label;
  };

  return (
    <div className="p-4 bg-white border-t border-slate-100/50 sticky bottom-0 select-none">
      <Button
        onClick={handleExport}
        disabled={isExporting || bills.length === 0}
        variant="primary"
        className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 h-12 text-xs font-bold shadow-[0_4px_12px_rgba(22,163,74,0.15)] active:bg-primary-700 active:scale-98 transition-all"
        id="btn-download-pdf"
      >
        {isExporting ? (
          <>
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            {t.language === 'ta' ? 'PDF அறிக்கை தயாரிக்கப்படுகிறது...' : 'Generating PDF Report...'}
          </>
        ) : (
          <>
            <FileDown className="h-4.5 w-4.5 shrink-0" />
            {getLabel()}
          </>
        )}
      </Button>
    </div>
  );
}
