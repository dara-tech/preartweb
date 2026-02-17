import React from 'react';
import { Button } from "@/components/ui/button";
import { Printer } from 'lucide-react';

const ReportPreview = ({ 
  isOpen, 
  onClose, 
  previewContent, 
  onPrint 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <h3 className="text-lg font-semibold">Report Preview</h3>
          <div className="flex gap-2">
            <Button 
              onClick={onPrint} 
              variant="outline" 
              size="sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button 
              onClick={onClose} 
              variant="outline" 
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            title="Report Preview"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
