export interface FolderType {
  id: string;
  name: string;
  path: string;
  parentId?: string | null;
  createdAt: string;
  _count: {
    children: number;
    files: number;
  };
}

export interface BreadcrumbData {
  id: string | null;
  name: string;
  path: string;
}

export interface FileType {
  id: string;
  name: string;
  size: string;
  modifiedAt: string;
}

// File conflict resolution options
export type ConflictResolution = 'overwrite' | 'keep-both' | 'cancel';

// Extended file type with optional folder path for flat view
export interface ExtendedFileType extends FileType {
  folderPath?: string;
}
