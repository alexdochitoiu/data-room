import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Large 404 */}
          <div className="text-8xl font-bold text-gray-300 mb-4">404</div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Page Not Found
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            Sorry, we couldn't find the page you're looking for.
          </p>

          {/* Illustration */}
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Search className="h-12 w-12 text-gray-400" />
          </div>

          {/* Actions */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button asChild className="w-full bg-blue-600 hover:!bg-blue-700 sm:w-auto">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/documents">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Documents
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
