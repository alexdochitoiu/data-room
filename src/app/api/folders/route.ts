import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import {
  createFolderSchema,
  renameFolderSchema,
  deleteFolderSchema,
} from './validations';
import fs from 'fs-extra';

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

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id } = deleteFolderSchema.parse(body);

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

    // Helper function to recursively delete folder and its contents
    const deleteFolder = async (folderId: string) => {
      // Get all files in this folder
      const files = await prisma.file.findMany({
        where: { folderId, userId: user.id },
      });

      // Delete files from filesystem
      for (const file of files) {
        try {
          if (await fs.pathExists(file.path)) {
            await fs.unlink(file.path);
          }
        } catch (fsError) {
          console.error('Error deleting file from filesystem:', fsError);
          // Continue with other files even if one fails
        }
      }

      // Get all subfolders
      const subfolders = await prisma.folder.findMany({
        where: { parentId: folderId, userId: user.id },
      });

      // Recursively delete subfolders
      for (const subfolder of subfolders) {
        await deleteFolder(subfolder.id);
      }

      // Delete the folder from database (this will cascade delete files due to schema)
      await prisma.folder.delete({
        where: { id: folderId },
      });
    };

    // Start recursive deletion
    await deleteFolder(id);

    return NextResponse.json({
      success: true,
      message: 'Folder and all its contents deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
