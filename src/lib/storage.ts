export async function uploadToVercelBlob(
  data: Buffer | File,
  filename: string
): Promise<{ url: string }> {
  const { put } = await import('@vercel/blob');

  const result = await put(filename, data, {
    access: 'public',
  });

  return { url: result.url };
}

export function getStorageMethod(): 'local' | 'vercel-blob' {
  // Force cloud storage in production
  if (process.env.VERCEL) {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      return 'vercel-blob';
    }
    // If no cloud storage is configured in production, this is an error
    throw new Error(
      'Cloud storage must be configured for production deployment'
    );
  }

  // In development, use cloud storage if configured, otherwise allow local
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return 'vercel-blob';
  }

  return 'local';
}
