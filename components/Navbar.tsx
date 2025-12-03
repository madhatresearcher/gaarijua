"use client"
import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">Gaarijua</Link>
        <nav className="flex items-center gap-4">
          <Link href="/cars" className="text-sm text-gray-700">Cars</Link>
          <Link href="/parts" className="text-sm text-gray-700">Parts</Link>
          <a className="text-sm text-gray-700">Sign in</a>
        </nav>
      </div>
    </header>
  )
}
