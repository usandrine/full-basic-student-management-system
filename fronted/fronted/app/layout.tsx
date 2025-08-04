// frontend/app/layout.tsx
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Providers } from './providers'; // Import your Providers component

export const metadata: Metadata = {
  title: 'Student Mnagement system', // You might want to change this title later
  description: 'system',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Providers> {/* <-- WRAP CHILDREN WITH YOUR PROVIDERS COMPONENT HERE */}
          {children}
        </Providers>
      </body>
    </html>
  )
}