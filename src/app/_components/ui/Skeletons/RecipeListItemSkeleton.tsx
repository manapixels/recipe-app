import Image from 'next/image';

const RecipeListItemSkeleton = () => {
  return (
    <div
      role="status"
      className="animate-pulse relative flex md:gap-4 md:p-6 rounded-lg bg-white border"
    >
      <div className="relative aspect-square flex-shrink-0">
        <div className="bg-gray-200 rounded-lg w-32 md:w-40 h-full flex justify-center items-center">
          <Image
            src="/logo.svg"
            alt="Inner Circle"
            width="95"
            height="95"
            className="grayscale opacity-20 w-24 md:w-28 h-full"
          />
        </div>
      </div>
      <div className="flex-1 space-y-4 flex flex-col justify-between w-full p-4 md:p-0">
        <div className="w-full">
          <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[240px] mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2"></div>
        </div>
        <div className="w-3/4">
          <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[240px] mb-2"></div>
          <div className="h-3 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default RecipeListItemSkeleton;
