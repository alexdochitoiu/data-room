'use client';

import { signIn, getProviders } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';
import GoogleIcon from '@/components/GoogleIcon';
import { Providers } from './types';

export default function SignIn() {
  const [providers, setProviders] = useState<Providers | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    fetchProviders();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-96 bg-slate-800 flex flex-col">
        <div className="px-6 py-6">
          <Logo />
        </div>

        <div className="flex-1 px-6 py-8">
          <div className="text-slate-300">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Welcome to DataRoom
            </h2>
            <p className="text-sm leading-relaxed mb-6">
              Your secure document management platform. Sign in to access your
              files, collaborate with your team, and manage your data room with
              confidence.
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

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">
              Choose your preferred sign-in method
            </p>
          </div>

          <div className="space-y-3">
            {providers &&
              Object.values(providers).map(provider => (
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
                      <GoogleIcon className="h-5 w-5" />
                    )}
                    {provider.id === 'github' && (
                      <Github className="h-5 w-5 text-gray-800" />
                    )}
                    <span className="font-medium">
                      Continue with {provider.name}
                    </span>
                  </div>
                </Button>
              ))}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
