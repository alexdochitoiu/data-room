import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, ExternalLink, X } from 'lucide-react'

interface FilePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  file: {
    id: string
    name: string
    size: string
    modifiedAt: string
  } | null
}

export function FilePreviewModal({ isOpen, onClose, file }: FilePreviewModalProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  if (!file) return null

  const fileUrl = `/api/files/${file.id}`

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = file.name
    link.click()
  }

  const handleOpenInNewTab = () => {
    window.open(fileUrl, '_blank')
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[85vw] !max-w-none h-[90vh] flex flex-col">
        <DialogHeader className="space-y-3 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold break-words leading-tight">
                {file.name}
              </DialogTitle>
              <DialogDescription>
                {file.size} • Modified {file.modifiedAt}
              </DialogDescription>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 mr-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenInNewTab}
                className="h-8 w-8 p-0"
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 relative border rounded-lg overflow-hidden bg-gray-50">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}

          {hasError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Unable to preview file
                </h3>
                <p className="text-gray-600 mb-4">
                  This PDF cannot be displayed in the browser.
                </p>
                <div className="space-x-3">
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                  <Button onClick={handleOpenInNewTab}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              src={fileUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={`Preview of ${file.name}`}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
