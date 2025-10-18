"use client";

/**
 * Loading skeleton component for better UX while data loads
 */
export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card animate-pulse">
          {/* Title and badge */}
          <div className="flex items-start justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="h-6 w-20 bg-gray-200 rounded"></div>
          </div>

          {/* Progress section */}
          <div className="mb-4">
            <div className="flex justify-between mb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5"></div>
          </div>

          {/* Creator and status */}
          <div className="flex justify-between mb-4">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>

          {/* Button */}
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description: string; 
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mb-4 text-6xl">📭</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
}

/**
 * Error state component
 */
export function ErrorState({ 
  error, 
  retry 
}: { 
  error: string; 
  retry?: () => void;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mb-4 text-6xl">⚠️</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
      {retry && (
        <button onClick={retry} className="btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}

/**
 * Success banner component
 */
export function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-2xl">✅</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-green-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Info banner component
 */
export function InfoBanner({ message }: { message: string }) {
  return (
    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-2xl">ℹ️</span>
        </div>
        <div className="ml-3">
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      </div>
    </div>
  );
}
