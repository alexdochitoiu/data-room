import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { formatDate, formatFileSize } from '@/lib/utils';
import { ConflictResolution } from '@/types/types';
import { uploadToVercelBlob, getStorageMethod } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folderId = formData.get('folderId') as string | null;
    const resolution = formData.get('resolution') as ConflictResolution | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    const existingFile = await prisma.file.findFirst({
      where: {
        name: file.name,
        folderId: folderId || null,
        userId: user.id,
      },
    });

    // If file exists and no resolution provided, return conflict response
    if (existingFile && !resolution) {
      return NextResponse.json(
        {
          error: 'FILE_CONFLICT',
          message: 'A file with this name already exists',
          fileName: file.name,
        },
        { status: 409 }
      );
    }

    const storageMethod = getStorageMethod();
    let finalFileName = file.name;

    if (existingFile && resolution === 'keep-both') {
      const fileExtension = file.name.split('.').pop() || '';
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      let counter = 1;

      while (true) {
        const testName = `${baseName} (${counter}).${fileExtension}`;
        const testFile = await prisma.file.findFirst({
          where: {
            name: testName,
            folderId: folderId || null,
            userId: user.id,
          },
        });

        if (!testFile) {
          finalFileName = testName;
          break;
        }
        counter++;
      }
    } else if (existingFile && resolution === 'overwrite') {
      // Delete from cloud storage if using Vercel Blob
      if (storageMethod === 'vercel-blob' && existingFile.path.includes('vercel-storage.com')) {
        try {
          const { del } = await import('@vercel/blob');
          await del(existingFile.path, {
            token: process.env.BLOB_READ_WRITE_TOKEN,
          });
        } catch (error) {
          console.error('Failed to delete file from cloud storage:', error);
          // Continue with database deletion even if cloud deletion fails
        }
      }

      await prisma.file.delete({
        where: { id: existingFile.id },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let fileUrl: string;

    if (storageMethod === 'vercel-blob') {
      const fileExtension = finalFileName.split('.').pop() || '';
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

      const result = await uploadToVercelBlob(buffer, uniqueFilename);
      fileUrl = result.url;
    } else if (storageMethod === 'local') {
      const fs = await import('fs-extra');
      const path = await import('path');

      const uploadsDir = path.join(process.cwd(), 'uploads');
      await fs.ensureDir(uploadsDir);

      const fileExtension = finalFileName.split('.').pop() || '';
      const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      await fs.writeFile(filePath, buffer);
      fileUrl = `/api/files/${uniqueFilename}/download`; // Local file serving endpoint
    } else {
      throw new Error(`Storage method ${storageMethod} not implemented`);
    }

    // Save file metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        name: finalFileName,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: fileUrl, // Store the cloud storage URL instead of local path
        folderId: folderId || null,
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        id: fileRecord.id,
        name: fileRecord.name,
        size: formatFileSize(fileRecord.size),
        modifiedAt: formatDate(fileRecord.createdAt),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
