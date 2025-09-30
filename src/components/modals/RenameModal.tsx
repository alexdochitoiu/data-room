import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileType, FolderType } from '@/types/types';
import toast from 'react-hot-toast';

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRenamed: (item: FolderType | FileType) => void;
  item: {
    id: string;
    name: string;
    type: 'folder' | 'file';
  } | null;
}

export function RenameModal({
  isOpen,
  onClose,
  onRenamed,
  item,
}: RenameModalProps) {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Set initial name when item changes
  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  // Select text when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item || !newName.trim()) {
      const errorMsg = 'Name is required';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (newName.trim() === item.name) {
      handleClose();
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const endpoint = item.type === 'folder' ? '/api/folders' : '/api/files';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: item.id,
          name: newName.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to rename ${item.type}`);
      }

      const renamedItem = await response.json();
      onRenamed(renamedItem);
      handleClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : `Failed to rename ${item?.type}`;
      setError(errorMsg);
      toast.error(`Rename failed: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewName('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Rename {item.type}</DialogTitle>
          <DialogDescription>
            Enter a new name for this {item.type}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                ref={inputRef}
                id="name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="col-span-3"
                placeholder={`Enter ${item.type} name`}
                disabled={isLoading}
                autoFocus
              />
            </div>
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
              disabled={isLoading || !newName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
