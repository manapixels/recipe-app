import Link from 'next/link';

export default async function NotFound() {
  return (
    <div>
      <div className="xl:pt-24 w-full max-w-lg xl:w-1/2 relative pb-12 lg:pb-0 mx-auto">
        <div className="aspect-square">
          <div className="flex justify-center items-center grow-0 and shrink-0 w-64 h-64 md:w-96 md:h-96 lg:w-128 lg:h-128 xl:w-160 xl:h-160 2xl:w-192 2xl:h-192 bg-gray-200 rounded-full">
            <p className="text-xl lg:text-4xl font-bold">Page not found</p>
          </div>
        </div>
        <Link
          href="/"
          className="sm:w-full lg:w-auto my-2 border rounded-xl md py-4 px-8 text-center bg-base-100 text-black font-bold hover:bg-base-200 focus:outline-none focus:ring-2 focus:ring-indigo-700 focus:ring-opacity-50 block"
        >
          Go back home{' '}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            style={{ display: 'inline-block' }}
          >
            <path fill="currentColor" d="M4 21V9l8-6l8 6v12h-6v-7h-4v7z"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
}
