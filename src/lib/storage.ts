export async function uploadToVercelBlob(
  data: Buffer | File,
  filename: string
): Promise<{ url: string }> {
  // Check if token is available
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured. Please set up Vercel Blob storage.');
  }

  const { put } = await import('@vercel/blob');

  const result = await put(filename, data, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
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
      'BLOB_READ_WRITE_TOKEN not found. Please configure Vercel Blob storage in your Vercel Dashboard.'
    );
  }

  // In development, use cloud storage if configured, otherwise allow local
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return 'vercel-blob';
  }

  return 'local';
}
