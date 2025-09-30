'use client';

import { useSession } from 'next-auth/react';
import DocumentView from '@/components/DocumentView';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FolderOpen } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (!session) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center h-full">
        <FolderOpen className="h-18 w-18 text-blue-400" />
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Welcome to Data Room</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your documents and folders.{' '}
            <Link
              href="/auth/signin"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return <DocumentView />;
}
