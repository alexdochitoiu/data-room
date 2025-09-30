import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import fs from 'fs-extra'

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fileId = params.fileId

    // Get file from database and verify ownership
    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        user: { email: session.user.email },
      },
    })

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Check if file exists on disk
    if (!(await fs.pathExists(file.path))) {
      return NextResponse.json(
        { error: 'File not found on disk' },
        { status: 404 }
      )
    }

    // Read and serve the file
    const fileBuffer = await fs.readFile(file.path)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Length': file.size.toString(),
        'Content-Disposition': `inline; filename="${file.originalName}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
