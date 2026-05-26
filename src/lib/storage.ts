/** Local disk uploads do not persist on Vercel serverless. */
export function isFilesystemStorageAvailable(): boolean {
  return !process.env.VERCEL;
}

export const FILESYSTEM_STORAGE_MESSAGE =
  "File uploads are not available on this deployment. Use PostgreSQL + object storage (e.g. Vercel Blob) for production uploads.";
