import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schemas
const createFolderSchema = z.object({
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name too long'),
  parentId: z.string().optional(),
});

const renameFolderSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'Folder name is required')
    .max(255, 'Folder name too long'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    const folders = await prisma.folder.findMany({
      where: {
        user: { email: session.user.email },
        parentId: parentId || null,
      },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { children: true, files: true },
        },
      },
    });

    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, parentId } = createFolderSchema.parse(body);

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        },
      });
    }

    // Build path
    let path = '/';
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: { id: parentId, userId: user.id },
      });
      if (parentFolder) {
        path = `${parentFolder.path}${parentFolder.name}/`;
      }
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        path,
        parentId,
        userId: user.id,
      },
      include: {
        _count: {
          select: { children: true, files: true },
        },
      },
    });

    return NextResponse.json(folder, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name } = renameFolderSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if folder exists and belongs to user
    const existingFolder = await prisma.folder.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Check for duplicate names in the same directory
    const duplicateFolder = await prisma.folder.findFirst({
      where: {
        name,
        parentId: existingFolder.parentId,
        userId: user.id,
        id: { not: id }, // Exclude current folder
      },
    });

    if (duplicateFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists in this location' },
        { status: 409 }
      );
    }

    // Update folder name
    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: { name },
      include: {
        _count: {
          select: { children: true, files: true },
        },
      },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('Error renaming folder:', error);
    return NextResponse.json(
      { error: 'Failed to rename folder' },
      { status: 500 }
    );
  }
}
