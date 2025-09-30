'use client';

import { NewFolderModal } from './modals/NewFolderModal';
import { FileUploadModal } from './modals/FileUploadModal';
import { FilePreviewModal } from './modals/FilePreviewModal';
import { RenameModal } from './modals/RenameModal';
import { DeleteConfirmationModal } from './modals/DeleteConfirmationModal';
import { FileType, FolderType } from '@/types/types';
import { useDocumentViewStore } from '@/stores/documentViewStore';

export function Modals() {
  const {
    // Modal state
    isNewFolderModalOpen,
    isFileUploadModalOpen,
    isFilePreviewModalOpen,
    isRenameModalOpen,
    isDeleteModalOpen,
    selectedFile,
    itemToRename,
    itemToDelete,
    currentFolderId,

    // Modal actions
    closeNewFolderModal,
    closeFileUploadModal,
    closeFilePreviewModal,
    closeRenameModal,
    closeDeleteModal,

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
    </>
  );
}
