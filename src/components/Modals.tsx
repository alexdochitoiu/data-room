'use client';

import { NewFolderModal } from './modals/NewFolderModal';
import { FileUploadModal } from './modals/FileUploadModal';
import { FilePreviewModal } from './modals/FilePreviewModal';
import { RenameModal } from './modals/RenameModal';
import { DeleteConfirmationModal } from './modals/DeleteConfirmationModal';
import { FileConflictModal } from './modals/FileConflictModal';
import { FileType, FolderType, ConflictResolution } from '@/types/types';
import { useDocumentViewStore } from '@/stores/documentViewStore';

export function Modals() {
  const {
    // Modal state
    isNewFolderModalOpen,
    isFileUploadModalOpen,
    isFilePreviewModalOpen,
    isRenameModalOpen,
    isDeleteModalOpen,
    isFileConflictModalOpen,
    selectedFile,
    itemToRename,
    itemToDelete,
    conflictingFile,
    currentFolderId,

    // Modal actions
    closeNewFolderModal,
    closeFileUploadModal,
    closeFilePreviewModal,
    closeRenameModal,
    closeDeleteModal,
    closeFileConflictModal,

    // Store methods for handling events
    addFolder,
    addFile,
    updateFolder,
    updateFile,
    deleteItem,
  } = useDocumentViewStore();

  // Event handlers using store methods directly
  const handleFolderCreated = (folder: FolderType) => {
    addFolder(folder);
  };

  const handleFileUploaded = (file: FileType) => {
    addFile(file);
  };

  const handleItemRenamed = (renamedItem: FolderType | FileType) => {
    // Determine type based on the renamedItem structure
    // Files have properties like size, folders don't have _count
    if ('size' in renamedItem) {
      updateFile(renamedItem.id, renamedItem);
    } else {
      updateFolder(renamedItem.id, renamedItem);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    await deleteItem(itemToDelete.id, itemToDelete.type);
  };

  const handleFileConflictResolve = async (resolution: ConflictResolution) => {
    if (!conflictingFile) return;

    if (resolution === 'cancel') {
      return; // Just close the modal, no upload
    }

    try {
      const formData = new FormData();
      formData.append('file', conflictingFile.file);
      formData.append('resolution', resolution);
      if (conflictingFile.folderId) {
        formData.append('folderId', conflictingFile.folderId);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload file');
      }

      const uploadedFile = await response.json();
      handleFileUploaded(uploadedFile);
    } catch (error) {
      console.error('Failed to resolve file conflict:', error);
      // You might want to show an error message here
    }
  };

  return (
    <>
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
        onConfirm={handleConfirmDelete}
        title={`Delete ${itemToDelete?.type || 'Item'}`}
        description={`Are you sure you want to delete this ${itemToDelete?.type || 'item'}?`}
        itemName={itemToDelete?.name || ''}
        itemType={itemToDelete?.type || 'file'}
      />

      {/* File Conflict Modal */}
      <FileConflictModal
        isOpen={isFileConflictModalOpen}
        fileName={conflictingFile?.fileName || ''}
        onResolve={handleFileConflictResolve}
        onClose={closeFileConflictModal}
      />
    </>
  );
}
