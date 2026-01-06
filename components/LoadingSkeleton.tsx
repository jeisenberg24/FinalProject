export function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse space-y-4 w-full max-w-md">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-32 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}

