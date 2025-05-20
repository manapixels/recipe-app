export default async function Footer() {
  return (
    <footer className="max-w-6xl w-full mx-auto bg-opacity-80 bg-white">
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
        <div className="text-sm">© {new Date().getFullYear()} recipe-app</div>
      </div>
    </footer>
  );
}
