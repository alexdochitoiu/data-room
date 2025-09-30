'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FolderPlus,
  Upload,
  Folder,
  FileText,
  MoreHorizontal,
  Search,
  Home,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NewFolderModal } from './modals/NewFolderModal';
import { FileUploadModal } from './modals/FileUploadModal';
import { FilePreviewModal } from './modals/FilePreviewModal';
import { RenameModal } from './modals/RenameModal';
import { DeleteConfirmationModal } from './modals/DeleteConfirmationModal';
import { Breadcrumbs } from './Breadcrumbs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileType, FolderType } from '@/types/types';
import { useDocumentViewStore } from '@/stores/documentViewStore';

interface DocumentViewProps {
  title?: string;
  showOnlyFiles?: boolean;
}

export default function DocumentView({
  title = 'Welcome to DataRoom',
  showOnlyFiles = false,
}: DocumentViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Zustand store
  const {
    // State
    folders,
    files,
    currentFolderId,
    searchQuery,
    isLoading,
    isNewFolderModalOpen,
    isFileUploadModalOpen,
    isFilePreviewModalOpen,
    isRenameModalOpen,
    isDeleteModalOpen,
    selectedFile,
    itemToRename,
    itemToDelete,

    // Actions
    setCurrentFolderId,
    setSearchQuery,
    addFolder,
    addFile,
    updateFolder,
    updateFile,
    loadFolders,
    loadFiles,
    deleteItem,

    // Modal actions
    openNewFolderModal,
    closeNewFolderModal,
    openFileUploadModal,
    closeFileUploadModal,
    openFilePreviewModal,
    closeFilePreviewModal,
    openRenameModal,
    closeRenameModal,
    openDeleteModal,
    closeDeleteModal,
  } = useDocumentViewStore();

  // Initialize current folder from URL
  useEffect(() => {
    const folderId = searchParams.get('folder');
    setCurrentFolderId(folderId);
  }, [searchParams, setCurrentFolderId]);

  // Load data when current folder changes
  useEffect(() => {
    if (!showOnlyFiles) {
      loadFolders(currentFolderId);
    }
    loadFiles(currentFolderId);
  }, [currentFolderId, showOnlyFiles, loadFolders, loadFiles]);

  // Event handlers
  const handleFolderCreated = (folder: FolderType) => {
    addFolder(folder);
  };

  const handleFileUploaded = (file: FileType) => {
    addFile(file);
  };

  const handleFileClick = (file: FileType) => {
    openFilePreviewModal(file);
  };

  const handleRenameFolder = (folder: FolderType) => {
    openRenameModal({ id: folder.id, name: folder.name, type: 'folder' });
  };

  const handleRenameFile = (file: FileType) => {
    openRenameModal({ id: file.id, name: file.name, type: 'file' });
  };

  const handleItemRenamed = (renamedItem: FolderType | FileType) => {
    if (itemToRename?.type === 'folder') {
      updateFolder(renamedItem.id, renamedItem);
    } else if (itemToRename?.type === 'file') {
      updateFile(renamedItem.id, renamedItem);
    }
  };

  const handleDeleteFolder = (folder: FolderType) => {
    openDeleteModal({ id: folder.id, name: folder.name, type: 'folder' });
  };

  const handleDeleteFile = (file: FileType) => {
    openDeleteModal({ id: file.id, name: file.name, type: 'file' });
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteItem(itemToDelete.id, itemToDelete.type);
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
    // Stay on the current page, just update the folder parameter
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?folder=${folderId}`);
  };

  const filteredFolders = showOnlyFiles
    ? []
    : folders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>

          <div className="flex items-center space-x-3">
            {!showOnlyFiles && (
              <Button variant="outline" size="sm" onClick={openNewFolderModal}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            )}
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={openFileUploadModal}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumbs />
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="pl-10"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : filteredFolders.length === 0 && filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Folder className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showOnlyFiles ? 'No files yet' : 'No files or folders yet'}
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              {showOnlyFiles
                ? 'Upload files to get started with your data room.'
                : 'Get started by uploading files or creating folders to organize your documents.'}
            </p>
            <div className="flex space-x-3">
              {!showOnlyFiles && (
                <Button variant="outline" onClick={openNewFolderModal}>
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              )}
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={openFileUploadModal}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Folders */}
            {filteredFolders.map(folder => (
              <div
                key={folder.id}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleFolderClick(folder.id)}
              >
                <Folder className="h-8 w-8 text-blue-500 mr-4" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{folder.name}</h4>
                  <p className="text-sm text-gray-500">
                    {folder._count.children} folders, {folder._count.files}{' '}
                    files
                  </p>
                </div>
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
                        handleRenameFolder(folder);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteFolder(folder);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {/* Files */}
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleFileClick(file)}
              >
                <FileText className="h-8 w-8 text-gray-500 mr-4" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{file.name}</h4>
                  <p className="text-sm text-gray-500">
                    {file.size} • {file.modifiedAt}
                  </p>
                </div>
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
                        handleRenameFile(file);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteFile(file);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Folder Modal */}
      <NewFolderModal
        isOpen={isNewFolderModalOpen}
        onClose={closeNewFolderModal}
        onFolderCreated={handleFolderCreated}
        parentId={currentFolderId || undefined}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={closeFileUploadModal}
        onFileUploaded={handleFileUploaded}
        folderId={currentFolderId || undefined}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isFilePreviewModalOpen}
        onClose={closeFilePreviewModal}
        file={selectedFile}
      />

      {/* Rename Modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={closeRenameModal}
        onRenamed={handleItemRenamed}
        item={itemToRename}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title={`Delete ${itemToDelete?.type || 'Item'}`}
        description={`Are you sure you want to delete this ${itemToDelete?.type || 'item'}?`}
        itemName={itemToDelete?.name || ''}
        itemType={itemToDelete?.type || 'file'}
      />
    </div>
  );
}
