import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    if (!folderId) {
      return NextResponse.json([])
    }

    // Find the folder and build breadcrumb trail
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        user: { email: session.user.email },
      },
    })

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Build breadcrumb trail by traversing up the hierarchy
    const breadcrumbs = []
    let currentFolder: typeof folder | null = folder

    while (currentFolder) {
      breadcrumbs.unshift({
        id: currentFolder.id,
        name: currentFolder.name,
        path: currentFolder.path,
      })

      if (currentFolder.parentId) {
        currentFolder = await prisma.folder.findFirst({
          where: {
            id: currentFolder.parentId,
            user: { email: session.user.email },
          },
        })
      } else {
        currentFolder = null
      }
    }

    return NextResponse.json(breadcrumbs)
  } catch (error) {
    console.error('Error fetching breadcrumbs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch breadcrumbs' },
      { status: 500 }
    )
  }
}
