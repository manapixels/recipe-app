export default async function Footer() {
  return (
    <footer className="max-w-7xl w-full mx-auto bg-gray-50 dark:bg-gray-800">
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} recipe-app
        </div>
      </div>
    </footer>
  );
}
