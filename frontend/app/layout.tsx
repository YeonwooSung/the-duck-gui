// app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Log Analyzer',
  description: 'HTTP Log analysis system',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Log Analyzer</h1>
              <div className="flex space-x-4">
                <div className="text-sm text-gray-500">
                  Last run: {new Date().toLocaleTimeString()}
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Share
                </button>
              </div>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}