'use client'

import { useSession } from 'next-auth/react'
import DocumentView from '@/components/DocumentView'

export default function Home() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Welcome to Data Room
          </h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your documents and folders.
          </p>
        </div>
      </div>
    )
  }

  return <DocumentView />
}
