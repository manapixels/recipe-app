import Image from 'next/image';

export default function RecipeListItemSkeleton() {
  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-lg animate-pulse">
      <div className="w-full md:w-48 relative aspect-square flex-shrink-0 bg-gray-200 rounded-lg">
        <Image
          src="/recipe-placeholder.svg"
          alt="Recipe"
          width="100"
          height="100"
          className="grayscale opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        />
      </div>

      <div className="min-w-0 py-2 flex-grow flex flex-col md:gap-4 justify-between">
        <div>
          {/* Recipe name & tags */}
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="items-center gap-2 mb-2 hidden md:flex">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          {/* Recipe details */}
          <div className="space-y-2 mt-4">
            <div className="h-3 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  );
}
