'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, FileText, Copy } from 'lucide-react';
import { ConflictResolution } from '@/types/types';

interface FileConflictModalProps {
  isOpen: boolean;
  fileName: string;
  onResolve: (resolution: ConflictResolution) => void;
  onClose: () => void;
}

export function FileConflictModal({
  isOpen,
  fileName,
  onResolve,
  onClose,
}: FileConflictModalProps) {
  const handleResolve = (resolution: ConflictResolution) => {
    onResolve(resolution);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle>File Already Exists</DialogTitle>
              <DialogDescription className="text-left">
                A file with the name "{fileName}" already exists in this
                location.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <FileText className="h-8 w-8 text-gray-500" />
            <div>
              <p className="font-medium text-gray-900">{fileName}</p>
              <p className="text-sm text-gray-500">
                Choose how you want to handle this conflict
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col space-y-2 sm:space-y-2 sm:space-x-0">
          <Button
            onClick={() => handleResolve('overwrite')}
            variant="destructive"
            className="w-full"
          >
            <FileText className="h-4 w-4 mr-2" />
            Replace existing file
          </Button>
          <Button
            onClick={() => handleResolve('keep-both')}
            variant="outline"
            className="w-full"
          >
            <Copy className="h-4 w-4 mr-2" />
            Keep both files
          </Button>
          <Button
            onClick={() => handleResolve('cancel')}
            variant="ghost"
            className="w-full"
          >
            Cancel upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
