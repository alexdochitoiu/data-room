'use client'

import Link from 'next/link'
import { FolderOpen } from 'lucide-react'

interface LogoProps {
  className?: string
  showTagline?: boolean
  clickable?: boolean
}

export default function Logo({
  className = '',
  showTagline = true,
  clickable = true,
}: LogoProps) {
  const logoContent = (
    <div className={`flex items-center ${className}`}>
      <FolderOpen className="h-8 w-8 text-blue-400 mr-3" />
      <div>
        <h1 className="text-white font-bold text-lg">DataRoom</h1>
        {showTagline && (
          <p className="text-slate-400 text-xs">Document Management</p>
        )}
      </div>
    </div>
  )

  if (clickable) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity">
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
