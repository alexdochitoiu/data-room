'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FolderPlus, Upload, Folder, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from './Breadcrumbs';
import { Modals } from './Modals';
import { ItemActionsDropdown } from './ItemActionsDropdown';
import { SearchBar } from './SearchBar';
import { FileType, FolderType, ExtendedFileType } from '@/types/types';
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

  const {
    folders,
    files,
    currentFolderId,
    searchQuery,
    isLoading,

    setCurrentFolderId,
    loadFolders,
    loadFiles,
    loadAllFiles,

    openNewFolderModal,
    openFileUploadModal,
    openFilePreviewModal,
    openRenameModal,
    openDeleteModal,
  } = useDocumentViewStore();

  useEffect(() => {
    const folderId = searchParams.get('folder');
    setCurrentFolderId(folderId);
  }, [searchParams, setCurrentFolderId]);

  useEffect(() => {
    if (showOnlyFiles) {
      // When showing only files, load all files from all folders
      loadAllFiles();
    } else {
      // Normal folder view
      loadFolders(currentFolderId);
      loadFiles(currentFolderId);
    }
  }, [currentFolderId, showOnlyFiles, loadFolders, loadFiles, loadAllFiles]);

  const handleFileClick = (file: FileType) => {
    openFilePreviewModal(file);
  };

  const handleRename = (item: FolderType | FileType) => {
    // Determine type based on the item structure
    const itemType = 'size' in item ? 'file' : 'folder';
    openRenameModal({ id: item.id, name: item.name, type: itemType });
  };

  const handleDelete = (item: FolderType | FileType) => {
    // Determine type based on the item structure
    const itemType = 'size' in item ? 'file' : 'folder';
    openDeleteModal({ id: item.id, name: item.name, type: itemType });
  };

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId);
    // Stay on the current page, just update the folder parameter
    const currentPath = window.location.pathname;
    router.push(`${currentPath}?folder=${folderId}`);
  };

  const filteredFolders = useMemo(
    () =>
      showOnlyFiles
        ? []
        : folders.filter(folder =>
            folder.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
    [showOnlyFiles, folders, searchQuery]
  );

  const filteredFiles = useMemo(
    () =>
      files.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [files, searchQuery]
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
      <SearchBar className="px-6 py-4 border-b border-gray-100" />

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
                <ItemActionsDropdown
                  item={folder}
                  onRename={handleRename}
                  onDelete={handleDelete}
                />
              </div>
            ))}

            {/* Files */}
            {filteredFiles.map(file => {
              const extendedFile = file as ExtendedFileType;
              return (
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
                      {showOnlyFiles && extendedFile.folderPath && (
                        <> • in {extendedFile.folderPath}</>
                      )}
                    </p>
                  </div>
                  <ItemActionsDropdown
                    item={file}
                    onRename={handleRename}
                    onDelete={handleDelete}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modals />
    </div>
  );
}
