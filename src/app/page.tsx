'use client'

import { useSession } from 'next-auth/react'
import Navigation from '@/components/Navigation'

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Welcome to Data Room
          </h1>
          
          {status === 'loading' ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : session ? (
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Hello, {session.user?.name}!
              </h2>
              <div className="text-gray-600 space-y-2">
                <p><strong>Email:</strong> {session.user?.email}</p>
                <p><strong>Provider:</strong> {session.user?.id ? 'Authenticated' : 'Guest'}</p>
              </div>
              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  You are successfully signed in. You can now access the secure data room features.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Sign In Required
              </h2>
              <p className="text-gray-600 mb-6">
                Please sign in to access the data room features. We support Google and GitHub authentication.
              </p>
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure authentication with OAuth 2.0</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
