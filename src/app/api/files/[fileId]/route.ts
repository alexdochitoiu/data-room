import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getStorageMethod } from '@/lib/storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const fileId = resolvedParams.fileId;

    const file = await prisma.file.findFirst({
      where: {
        id: fileId,
        user: { email: session.user.email },
      },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const storageMethod = getStorageMethod();

    if (storageMethod === 'vercel-blob') {
      // For cloud storage, redirect to the URL directly
      // This is more efficient and leverages CDN capabilities
      return NextResponse.redirect(file.path);
    } else if (storageMethod === 'local') {
      // For local storage in development
      const fs = await import('fs-extra');

      // file.path contains the local file path
      if (!(await fs.pathExists(file.path))) {
        return NextResponse.json(
          { error: 'File not found on disk' },
          { status: 404 }
        );
      }

      const fileBuffer = await fs.readFile(file.path);

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': file.mimeType,
          'Content-Length': file.size.toString(),
          'Content-Disposition': `inline; filename="${file.originalName}"`,
          'Cache-Control': 'private, max-age=3600',
        },
      });
    } else {
      return NextResponse.json(
        {
          error: `Storage method ${storageMethod} not supported for file serving`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
