import LoadingSpinner from '@/components/LoadingSpinner';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <LoadingSpinner size="lg" />

        <h2 className="mt-6 text-lg font-medium text-gray-900">Loading...</h2>

        <p className="mt-2 text-sm text-gray-600">
          Please wait while we prepare your data room.
        </p>
      </div>
    </div>
  );
}
