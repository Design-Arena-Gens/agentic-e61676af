import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AR Beat Collage',
  description: 'Create and remix AR-powered beat collages',
  manifest: '/manifest.json'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
