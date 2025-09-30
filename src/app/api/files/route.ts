import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const renameFileSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, 'File name is required')
    .max(255, 'File name too long'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    const files = await prisma.file.findMany({
      where: {
        user: { email: session.user.email },
        folderId: folderId || null,
      },
      orderBy: { name: 'asc' },
    });

    // Format the files to match the expected interface
    const formattedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      size: formatFileSize(file.size),
      modifiedAt: formatDate(file.updatedAt),
    }));

    return NextResponse.json(formattedFiles);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
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
