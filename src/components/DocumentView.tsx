'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  FolderPlus, 
  Upload, 
  Folder, 
  FileText,
  MoreHorizontal,
  Search,
  Home,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NewFolderModal } from './NewFolderModal'
import { FileUploadModal } from './FileUploadModal'
import { FilePreviewModal } from './FilePreviewModal'
import { RenameModal } from './RenameModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface DocumentViewProps {
  currentPath?: string
  title?: string
  showOnlyFiles?: boolean
}

interface FolderType {
  id: string
  name: string
  path: string
  parentId?: string | null
  createdAt: string
  _count: {
    children: number
    files: number
  }
}

interface BreadcrumbData {
  id: string | null
  name: string
  path: string
}

interface FileType {
  id: string
  name: string
  size: string
  modifiedAt: string
}

export default function DocumentView({ currentPath = 'Root', title = 'Welcome to DataRoom', showOnlyFiles = false }: DocumentViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false)
  const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false)
  const [isFilePreviewModalOpen, setIsFilePreviewModalOpen] = useState(false)
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
  const [itemToRename, setItemToRename] = useState<{id: string, name: string, type: 'folder' | 'file'} | null>(null)
  const [folders, setFolders] = useState<FolderType[]>([])
  const [files, setFiles] = useState<FileType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbData[]>([])

  // Initialize current folder from URL
  useEffect(() => {
    const folderId = searchParams.get('folder')
    setCurrentFolderId(folderId)
  }, [searchParams])

  // Load folders, files and breadcrumbs when current folder changes
  useEffect(() => {
    if (!showOnlyFiles) {
      loadFolders(currentFolderId)
    }
    loadFiles(currentFolderId)
    loadBreadcrumbs(currentFolderId)
  }, [currentFolderId, showOnlyFiles])

  const loadFolders = async (parentId: string | null = null) => {
    setIsLoading(true)
    try {
      const url = parentId 
        ? `/api/folders?parentId=${parentId}` 
        : '/api/folders'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setFolders(data)
      }
    } catch (error) {
      console.error('Failed to load folders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadFiles = async (folderId: string | null = null) => {
    setIsLoading(true)
    try {
      const url = folderId 
        ? `/api/files?folderId=${folderId}` 
        : '/api/files'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setFiles(data)
      }
    } catch (error) {
      console.error('Failed to load files:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadBreadcrumbs = async (folderId: string | null) => {
    if (!folderId) {
      setBreadcrumbs([])
      return
    }

    try {
      const response = await fetch(`/api/folders/breadcrumbs?folderId=${folderId}`)
      if (response.ok) {
        const data = await response.json()
        setBreadcrumbs(data)
      }
    } catch (error) {
      console.error('Failed to load breadcrumbs:', error)
      setBreadcrumbs([])
    }
  }

  const handleFolderCreated = (folder: FolderType) => {
    setFolders(prev => [...prev, folder])
  }

  const handleFileUploaded = (file: FileType) => {
    setFiles(prev => [...prev, file])
  }

  const handleFileClick = (file: FileType) => {
    setSelectedFile(file)
    setIsFilePreviewModalOpen(true)
  }

  const handleRenameFolder = (folder: FolderType) => {
    setItemToRename({ id: folder.id, name: folder.name, type: 'folder' })
    setIsRenameModalOpen(true)
  }

  const handleRenameFile = (file: FileType) => {
    setItemToRename({ id: file.id, name: file.name, type: 'file' })
    setIsRenameModalOpen(true)
  }

  const handleItemRenamed = (renamedItem: any) => {
    if (itemToRename?.type === 'folder') {
      setFolders(prev => prev.map(folder => 
        folder.id === renamedItem.id ? { ...folder, ...renamedItem } : folder
      ))
    } else if (itemToRename?.type === 'file') {
      setFiles(prev => prev.map(file => 
        file.id === renamedItem.id ? { ...file, ...renamedItem } : file
      ))
    }
  }

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId)
    // Stay on the current page, just update the folder parameter
    const currentPath = window.location.pathname
    router.push(`${currentPath}?folder=${folderId}`)
  }

  const handleBreadcrumbNavigate = (folderId: string | null) => {
    setCurrentFolderId(folderId)
    // Stay on the current page, just update or remove the folder parameter
    const currentPath = window.location.pathname
    const url = folderId ? `${currentPath}?folder=${folderId}` : currentPath
    router.push(url)
  }

  const filteredFolders = showOnlyFiles ? [] : folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          
          <div className="flex items-center space-x-3">
            {!showOnlyFiles && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsNewFolderModalOpen(true)}
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            )}
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setIsFileUploadModalOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>
        
        {/* Breadcrumbs - Only show when not at root level */}
        {breadcrumbs.length > 0 && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handleBreadcrumbNavigate(null)
                  }}
                  className="flex items-center gap-1"
                >
                  <Home className="h-4 w-4" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              
              {breadcrumbs.map((item, index) => (
                <div key={item.id} className="flex items-center">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {index === breadcrumbs.length - 1 ? (
                      <BreadcrumbPage>{item.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          handleBreadcrumbNavigate(item.id)
                        }}
                      >
                        {item.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>

      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
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
                : 'Get started by uploading files or creating folders to organize your documents.'
              }
            </p>
            <div className="flex space-x-3">
              {!showOnlyFiles && (
                <Button 
                  variant="outline"
                  onClick={() => setIsNewFolderModalOpen(true)}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  New Folder
                </Button>
              )}
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setIsFileUploadModalOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Folders */}
            {filteredFolders.map((folder) => (
              <div
                key={folder.id}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleFolderClick(folder.id)}
              >
                <Folder className="h-8 w-8 text-blue-500 mr-4" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{folder.name}</h4>
                  <p className="text-sm text-gray-500">
                    {folder._count.children} folders, {folder._count.files} files
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRenameFolder(folder)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle delete folder
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
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center p-3 rounded-lg hover:bg-gray-50 cursor-pointer group"
                onClick={() => handleFileClick(file)}
              >
                <FileText className="h-8 w-8 text-gray-500 mr-4" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{file.name}</h4>
                  <p className="text-sm text-gray-500">{file.size} • {file.modifiedAt}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRenameFile(file)
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle delete file
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
        onClose={() => setIsNewFolderModalOpen(false)}
        onFolderCreated={handleFolderCreated}
        parentId={currentFolderId || undefined}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileUploadModalOpen}
        onClose={() => setIsFileUploadModalOpen(false)}
        onFileUploaded={handleFileUploaded}
        folderId={currentFolderId || undefined}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        isOpen={isFilePreviewModalOpen}
        onClose={() => {
          setIsFilePreviewModalOpen(false)
          setSelectedFile(null)
        }}
        file={selectedFile}
      />

      {/* Rename Modal */}
      <RenameModal
        isOpen={isRenameModalOpen}
        onClose={() => {
          setIsRenameModalOpen(false)
          setItemToRename(null)
        }}
        onRenamed={handleItemRenamed}
        item={itemToRename}
      />
    </div>
  )
}
