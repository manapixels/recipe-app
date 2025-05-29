import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Header from '@/_components/Header';
import Footer from '@/_components/Footer';
import { Toaster } from '@/_components/ui/Toasts/Toaster';
import { UserProvider } from '@/_contexts/UserContext';
import { AuthProvider } from '@/_contexts/AuthContext';
import './globals.css';
import 'tippy.js/dist/tippy.css';
import URLToaster from './_components/ui/Toasts/URLToaster';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'recipe-app',
  description: 'a recipe app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <meta name="viewport" content="width=device-width, user-scalable=no" />
      </Head>
      <body className={`${inter.className} antialiased`}>
        <UserProvider>
          <AuthProvider>
            <div className="flex flex-col min-h-screen w-full">
              <Header />
              <div className="flex-grow px-4 sm:px-6 lg:px-8 py-4 max-w-7xl w-full mx-auto relative">
                {children}
              </div>
              <Footer />
              <Toaster />
              <URLToaster />
            </div>
            <div id="modal-portal"></div>
          </AuthProvider>
        </UserProvider>
      </body>
    </html>
  );
}
