import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Install zod for validation
const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255, 'Folder name too long'),
  parentId: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    const folders = await prisma.folder.findMany({
      where: {
        user: { email: session.user.email },
        parentId: parentId || null
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { children: true, files: true }
        }
      }
    })

    return NextResponse.json(folders)
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, parentId } = createFolderSchema.parse(body)

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image
        }
      })
    }

    // Build path
    let path = '/'
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, userId: user.id }
      })
      if (parentFolder) {
        path = `${parentFolder.path}${parentFolder.name}/`
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        path,
        parentId,
        userId: user.id
      },
      include: {
        _count: {
          select: { children: true, files: true }
        }
      }
    })

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    
    console.error('Error creating folder:', error)
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
  }
}
