'use client'

import { signIn, getProviders } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Github, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Provider {
  id: string
  name: string
  type: string
  signinUrl: string
  callbackUrl: string
}

interface Providers {
  [key: string]: Provider
}

export default function SignIn() {
  const [providers, setProviders] = useState<Providers | null>(null)

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-96 bg-slate-800 flex flex-col">
        {/* Logo */}
        <div className="flex items-center px-6 py-6">
          <Shield className="h-8 w-8 text-blue-400 mr-3" />
          <div>
            <h1 className="text-white font-bold text-lg">DataRoom</h1>
            <p className="text-slate-400 text-xs">Document Management</p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="flex-1 px-6 py-8">
          <div className="text-slate-300">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Welcome to DataRoom
            </h2>
            <p className="text-sm leading-relaxed mb-6">
              Your secure document management platform. Sign in to access your files, 
              collaborate with your team, and manage your data room with confidence.
            </p>
            <div className="space-y-3 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Secure file storage</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Team collaboration</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Access control</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Sign In
            </h2>
            <p className="text-gray-600">
              Choose your preferred sign-in method
            </p>
          </div>
          
          <div className="space-y-3">
            {providers &&
              Object.values(providers).map((provider) => (
                <Button
                  key={provider.name}
                  onClick={() => signIn(provider.id, { callbackUrl: '/' })}
                  variant="outline"
                  size="lg"
                  className={`w-full h-12 border-2 transition-all duration-200 ${
                    provider.id === 'google'
                      ? 'border-gray-300 hover:border-red-500 hover:bg-red-50 text-gray-700 hover:text-red-600'
                      : provider.id === 'github'
                      ? 'border-gray-300 hover:border-gray-700 hover:bg-gray-50 text-gray-700 hover:text-gray-900'
                      : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-3 w-full">
                    {provider.id === 'google' && (
                      <svg className="h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    )}
                    {provider.id === 'github' && (
                      <Github className="h-5 w-5 text-gray-800" />
                    )}
                    <span className="font-medium">Continue with {provider.name}</span>
                  </div>
                </Button>
              ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
