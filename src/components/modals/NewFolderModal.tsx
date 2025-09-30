import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FolderType } from '@/types/types';
import toast from 'react-hot-toast';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFolderCreated: (folder: FolderType) => void;
  parentId?: string;
}

export function NewFolderModal({
  isOpen,
  onClose,
  onFolderCreated,
  parentId,
}: NewFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderName.trim()) {
      const errorMsg = 'Folder name is required';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: folderName.trim(),
          parentId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create folder');
      }

      const folder = await response.json();
      onFolderCreated(folder);
      setFolderName('');
      onClose();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to create folder';
      setError(errorMsg);
      toast.error(`Failed to create folder: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFolderName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Folder</DialogTitle>
          <DialogDescription>
            Create a new folder to organize your documents.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Input
              id="name"
              value={folderName}
              onChange={e => setFolderName(e.target.value)}
              className="flex-1"
              placeholder="Enter folder name"
              disabled={isLoading}
              autoFocus
            />
            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Creating...' : 'Create Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
