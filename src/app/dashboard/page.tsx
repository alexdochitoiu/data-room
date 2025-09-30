'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Upload, Activity, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin') // Not authenticated
  }, [session, status, router])

  if (status === 'loading') {
    return <LoadingSpinner />
  }

  if (!session) {
    return null // Will redirect to sign in
  }

  return (
    <div className="flex-1 bg-background p-8">
      <main className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Welcome to your secure data room dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* File Upload Card */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Upload className="w-8 h-8 text-primary mr-3" />
              <h2 className="text-xl font-semibold">Upload Files</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Securely upload and manage your documents.
            </p>
            <Button className="w-full">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>{' '}
          {/* Recent Activity Card */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Activity className="w-8 h-8 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              View recent access and modifications.
            </p>
            <Button variant="secondary" className="w-full">
              <Activity className="w-4 h-4 mr-2" />
              View Activity Log
            </Button>
          </div>
          {/* Access Control Card */}
          <div className="bg-card rounded-lg border p-6">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-purple-600 mr-3" />
              <h2 className="text-xl font-semibold">Access Control</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Manage user permissions and access rights.
            </p>
            <Button variant="outline" className="w-full">
              <Shield className="w-4 h-4 mr-2" />
              Manage Access
            </Button>
          </div>
        </div>

        {/* User Info Section */}
        <div className="mt-8 bg-card rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-4">Session Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span>
              <span className="ml-2 text-muted-foreground">
                {session.user?.name}
              </span>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <span className="ml-2 text-muted-foreground">
                {session.user?.email}
              </span>
            </div>
            <div>
              <span className="font-medium">User ID:</span>
              <span className="ml-2 text-muted-foreground">
                {session.user?.id}
              </span>
            </div>
            <div>
              <span className="font-medium">Status:</span>
              <span className="ml-2 text-green-600 font-medium">
                Authenticated
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
