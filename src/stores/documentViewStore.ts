import { create } from 'zustand';
import { BreadcrumbData, FileType, FolderType } from '@/types/types';

interface DocumentViewState {
  // Data state
  folders: FolderType[];
  files: FileType[];
  breadcrumbs: BreadcrumbData[];
  currentFolderId: string | null;
  searchQuery: string;
  isLoading: boolean;

  // Modal states
  isNewFolderModalOpen: boolean;
  isFileUploadModalOpen: boolean;
  isFilePreviewModalOpen: boolean;
  isRenameModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isFileConflictModalOpen: boolean;

  // Selected items
  selectedFile: FileType | null;
  itemToRename: {
    id: string;
    name: string;
    type: 'folder' | 'file';
  } | null;
  itemToDelete: {
    id: string;
    name: string;
    type: 'folder' | 'file';
  } | null;
  conflictingFile: {
    file: File;
    fileName: string;
    folderId?: string;
  } | null;

  // Actions
  setFolders: (folders: FolderType[]) => void;
  addFolder: (folder: FolderType) => void;
  updateFolder: (id: string, updates: Partial<FolderType>) => void;
  removeFolder: (id: string) => void;

  setFiles: (files: FileType[]) => void;
  addFile: (file: FileType) => void;
  updateFile: (id: string, updates: Partial<FileType>) => void;
  removeFile: (id: string) => void;

  setBreadcrumbs: (breadcrumbs: BreadcrumbData[]) => void;
  setCurrentFolderId: (folderId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setIsLoading: (loading: boolean) => void;

  // Modal actions
  openNewFolderModal: () => void;
  closeNewFolderModal: () => void;
  openFileUploadModal: () => void;
  closeFileUploadModal: () => void;
  openFilePreviewModal: (file: FileType) => void;
  closeFilePreviewModal: () => void;
  openRenameModal: (item: {
    id: string;
    name: string;
    type: 'folder' | 'file';
  }) => void;
  closeRenameModal: () => void;
  openDeleteModal: (item: {
    id: string;
    name: string;
    type: 'folder' | 'file';
  }) => void;
  closeDeleteModal: () => void;
  openFileConflictModal: (conflictData: {
    file: File;
    fileName: string;
    folderId?: string;
  }) => void;
  closeFileConflictModal: () => void;

  // API actions
  loadFolders: (parentId?: string | null) => Promise<void>;
  loadFiles: (folderId?: string | null) => Promise<void>;
  loadBreadcrumbs: (folderId?: string | null) => Promise<void>;
  deleteItem: (id: string, type: 'folder' | 'file') => Promise<void>;
}

export const useDocumentViewStore = create<DocumentViewState>((set, get) => ({
  // Initial state
  folders: [],
  files: [],
  breadcrumbs: [],
  currentFolderId: null,
  searchQuery: '',
  isLoading: true,
  isNewFolderModalOpen: false,
  isFileUploadModalOpen: false,
  isFilePreviewModalOpen: false,
  isRenameModalOpen: false,
  isDeleteModalOpen: false,
  isFileConflictModalOpen: false,
  selectedFile: null,
  itemToRename: null,
  itemToDelete: null,
  conflictingFile: null,

  // Data actions
  setFolders: folders => set({ folders }),
  addFolder: folder => set(state => ({ folders: [...state.folders, folder] })),
  updateFolder: (id, updates) =>
    set(state => ({
      folders: state.folders.map(folder =>
        folder.id === id ? { ...folder, ...updates } : folder
      ),
    })),
  removeFolder: id =>
    set(state => ({
      folders: state.folders.filter(folder => folder.id !== id),
    })),

  setFiles: files => set({ files }),
  addFile: file => set(state => ({ files: [...state.files, file] })),
  updateFile: (id, updates) =>
    set(state => ({
      files: state.files.map(file =>
        file.id === id ? { ...file, ...updates } : file
      ),
    })),
  removeFile: id =>
    set(state => ({
      files: state.files.filter(file => file.id !== id),
    })),

  setBreadcrumbs: breadcrumbs => set({ breadcrumbs }),
  setCurrentFolderId: folderId => set({ currentFolderId: folderId }),
  setSearchQuery: query => set({ searchQuery: query }),
  setIsLoading: loading => set({ isLoading: loading }),

  // Modal actions
  openNewFolderModal: () => set({ isNewFolderModalOpen: true }),
  closeNewFolderModal: () => set({ isNewFolderModalOpen: false }),
  openFileUploadModal: () => set({ isFileUploadModalOpen: true }),
  closeFileUploadModal: () => set({ isFileUploadModalOpen: false }),
  openFilePreviewModal: file =>
    set({
      isFilePreviewModalOpen: true,
      selectedFile: file,
    }),
  closeFilePreviewModal: () =>
    set({
      isFilePreviewModalOpen: false,
      selectedFile: null,
    }),
  openRenameModal: item =>
    set({
      isRenameModalOpen: true,
      itemToRename: item,
    }),
  closeRenameModal: () =>
    set({
      isRenameModalOpen: false,
      itemToRename: null,
    }),
  openDeleteModal: item =>
    set({
      isDeleteModalOpen: true,
      itemToDelete: item,
    }),
  closeDeleteModal: () =>
    set({
      isDeleteModalOpen: false,
      itemToDelete: null,
    }),
  openFileConflictModal: conflictData =>
    set({
      isFileConflictModalOpen: true,
      conflictingFile: conflictData,
    }),
  closeFileConflictModal: () =>
    set({
      isFileConflictModalOpen: false,
      conflictingFile: null,
    }),

  // API actions
  loadFolders: async (parentId = null) => {
    set({ isLoading: true });
    try {
      const url = parentId
        ? `/api/folders?parentId=${parentId}`
        : '/api/folders';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        set({ folders: data });
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadFiles: async (folderId = null) => {
    set({ isLoading: true });
    try {
      const url = folderId ? `/api/files?folderId=${folderId}` : '/api/files';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        set({ files: data });
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  loadBreadcrumbs: async (folderId = null) => {
    try {
      if (!folderId) {
        set({ breadcrumbs: [] });
        return;
      }

      const response = await fetch(
        `/api/folders/breadcrumbs?folderId=${folderId}`
      );
      if (response.ok) {
        const data = await response.json();
        set({ breadcrumbs: data });
      }
    } catch (error) {
      console.error('Failed to load breadcrumbs:', error);
      set({ breadcrumbs: [] });
    }
  },

  deleteItem: async (id, type) => {
    const endpoint = type === 'folder' ? '/api/folders' : '/api/files';

    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${type}`);
    }

    // Optimistic update
    if (type === 'folder') {
      get().removeFolder(id);
    } else {
      get().removeFile(id);
    }
  },
}));
