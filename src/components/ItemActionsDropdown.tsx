'use client';

import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileType, FolderType } from '@/types/types';

interface ItemActionsDropdownProps {
  item: FileType | FolderType;
  onRename: (item: FileType | FolderType) => void;
  onDelete: (item: FileType | FolderType) => void;
}

export function ItemActionsDropdown({
  item,
  onRename,
  onDelete,
}: ItemActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100"
          onClick={e => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={e => {
            e.stopPropagation();
            onRename(item);
          }}
        >
          <Edit className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={e => {
            e.stopPropagation();
            onDelete(item);
          }}
          className="text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
