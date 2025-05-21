'use client';

import { Printer } from 'lucide-react';

export default function PrintRecipeButton() {
  const handlePrint = () => {
    // Ensure this runs only on the client-side (which it will, due to 'use client')
    window.print();
  };

  return (
    <button
      onClick={handlePrint}
      title="Print Recipe"
      className="no-print p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-base-500 dark:focus:ring-offset-gray-800"
    >
      <Printer className="w-5 h-5" />
      <span className="sr-only">Print Recipe</span>
    </button>
  );
}
