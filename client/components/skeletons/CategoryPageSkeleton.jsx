const Shimmer = () => (
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-200/50 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
);

const SkeletonBox = ({ className }) => (
  <div className={`relative overflow-hidden bg-gray-200 rounded-md ${className}`}>
    <Shimmer />
  </div>
);

export default function CategoryPageSkeleton() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-10">
      {/* Title Skeleton */}
      <SkeletonBox className="h-12 w-1/3" />

      <div className="grid grid-cols-1 lg:grid-cols-9 gap-6">
        {/* Popular List Skeleton (Left) */}
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-4">
          <SkeletonBox className="h-8 w-1/2 mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBox className="h-40 w-full" />
              <SkeletonBox className="h-6 w-5/6" />
              <SkeletonBox className="h-4 w-1/2" />
            </div>
          ))}
        </div>

        {/* Main News Skeleton (Middle) */}
        <div className="order-1 lg:order-2 lg:col-span-5 space-y-6">
          {[...Array(2)].map((_, i) => (
             <div key={i} className="p-4 border border-gray-200 rounded-xl">
              <SkeletonBox className="h-72 w-full mb-4" />
              <SkeletonBox className="h-8 w-3/4 mb-2" />
              <SkeletonBox className="h-4 w-1/2 mb-4" />
              <SkeletonBox className="h-12 w-full" />
            </div>
          ))}
        </div>

        {/* Latest List Skeleton (Right) */}
         <div className="order-3 lg:col-span-2 space-y-4">
          <SkeletonBox className="h-8 w-1/2 mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <SkeletonBox className="h-40 w-full" />
              <SkeletonBox className="h-6 w-5/6" />
              <SkeletonBox className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}