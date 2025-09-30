import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { formatDate, formatFileSize } from '@/lib/utils';
import { renameFileSchema, deleteFileSchema } from './validations';
import z from 'zod';
import fs from 'fs-extra';
import { FileType, ExtendedFileType } from '@/types/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const allFiles = searchParams.get('allFiles') === 'true';

    // If allFiles is requested, return all files from all folders
    const whereClause = allFiles
      ? { user: { email: session.user.email } }
      : {
          user: { email: session.user.email },
          folderId: folderId || null,
        };

    const files = await prisma.file.findMany({
      where: whereClause,
      include: allFiles
        ? {
            folder: {
              select: {
                name: true,
              },
            },
          }
        : undefined,
      orderBy: { name: 'asc' },
    });

    // Format the files to match the expected interface
    const formattedFiles = files.map<ExtendedFileType>(file => {
      const baseFile = {
        id: file.id,
        name: file.name,
        size: formatFileSize(file.size),
        modifiedAt: formatDate(file.updatedAt),
      };

      // Add folder path if we're showing all files and file has a folder
      if (allFiles && 'folder' in file && file.folder) {
        const fileWithFolder = file as typeof file & {
          folder: { name: string } | null;
        };
        if (fileWithFolder.folder) {
          return {
            ...baseFile,
            folderPath: fileWithFolder.folder.name,
          };
        }
      }

      return baseFile;
    });

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
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
    const { id, name } = renameFileSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if file exists and belongs to user
    const existingFile = await prisma.file.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check for duplicate names in the same directory
    const duplicateFile = await prisma.file.findFirst({
      where: {
        name,
        folderId: existingFile.folderId,
        userId: user.id,
        id: { not: id }, // Exclude current file
      },
    });

    if (duplicateFile) {
      return NextResponse.json(
        { error: 'A file with this name already exists in this location' },
        { status: 409 }
      );
    }

    // Update file name
    const updatedFile = await prisma.file.update({
      where: { id },
      data: { name, originalName: name },
    });

    return NextResponse.json({
      id: updatedFile.id,
      name: updatedFile.name,
      size: formatFileSize(updatedFile.size),
      modifiedAt: formatDate(updatedFile.updatedAt),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('Error renaming file:', error);
    return NextResponse.json(
      { error: 'Failed to rename file' },
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
    const { id } = deleteFileSchema.parse(body);

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if file exists and belongs to user
    const existingFile = await prisma.file.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete file from filesystem
    try {
      if (await fs.pathExists(existingFile.path)) {
        await fs.unlink(existingFile.path);
      }
    } catch (fsError) {
      console.error('Error deleting file from filesystem:', fsError);
      // Continue with database deletion even if filesystem deletion fails
    }

    // Delete file from database
    await prisma.file.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
