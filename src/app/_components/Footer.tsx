import Image from 'next/image';
import Link from 'next/link';

export default async function Footer() {
  return (
    <footer className="max-w-6xl w-full mx-auto bg-opacity-80 bg-white">
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
        <div className="text-sm">© {new Date().getFullYear()} recipe-app</div>
        <div className="rounded-lg flex items-center px-1">
          <Link
            href="https://t.me/recipe-app_ann"
            className="p-2 inline-block hover:bg-gray-100 rounded-lg group"
            target="_blank"
          >
            <svg
              stroke="currentColor"
              fill="currentColor"
              className="fill-gray-500"
              strokeWidth="0"
              viewBox="0 0 496 512"
              height="22"
              width="22"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M248,8C111.033,8,0,119.033,0,256S111.033,504,248,504,496,392.967,496,256,384.967,8,248,8ZM362.952,176.66c-3.732,39.215-19.881,134.378-28.1,178.3-3.476,18.584-10.322,24.816-16.948,25.425-14.4,1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25,5.342-39.5,3.652-3.793,67.107-61.51,68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608,69.142-14.845,10.194-26.894,9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7,18.45-13.7,108.446-47.248,144.628-62.3c68.872-28.647,83.183-33.623,92.511-33.789,2.052-.034,6.639.474,9.61,2.885a10.452,10.452,0,0,1,3.53,6.716A43.765,43.765,0,0,1,362.952,176.66Z"></path>
            </svg>
          </Link>
          <Link
            href="https://instagram.com/recipe-app.fam"
            className="p-2 inline-block hover:bg-gray-100 rounded-lg group"
            target="_blank"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 56 56"
              className="fill-gray-500 group-hover:fill-orange-500"
            >
              <path
                className="fill-gray-500"
                fill="currentColor"
                fillRule="evenodd"
                d="M39.006 3C46.735 3 53 9.27 53 16.994v22.012C53 46.735 46.73 53 39.006 53H16.994C9.265 53 3 46.73 3 39.006V16.994C3 9.265 9.27 3 16.994 3zM28 15c-7.18 0-13 5.82-13 13s5.82 13 13 13s13-5.82 13-13s-5.82-13-13-13m0 4a9 9 0 1 1 0 18a9 9 0 0 1 0-18m14.5-9a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7"
              />
            </svg>
          </Link>
          <Link
            href="https://www.xiaohongshu.com/user/profile/5a7a6e4be8ac2b63699feebc"
            className="p-2 inline-block hover:bg-gray-100 rounded-lg group"
            target="_blank"
          >
            <Image
              src="/xiaohongshu.svg"
              width={20}
              height={20}
              className="grayscale group-hover:grayscale-0 opacity-90 group-hover:opacity-100"
              alt="小红书"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}
