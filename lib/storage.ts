// ============================================================
// HRMS — File Storage Abstraction
// Swap implementations without changing call sites
// Phase 1: local filesystem. Phase 2+: S3/GCS compatible.
// ============================================================

import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export interface UploadResult {
  key: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

/**
 * Ensures the upload directory exists.
 */
async function ensureUploadDir(subDir: string): Promise<string> {
  const dir = path.join(UPLOAD_DIR, subDir);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

/**
 * Uploads a file to local storage (development).
 * In production, replace the body of this function with S3/GCS upload.
 */
export async function uploadFile(
  file: File,
  folder: string
): Promise<UploadResult> {
  const dir = await ensureUploadDir(folder);
  const ext = path.extname(file.name);
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
  const filePath = path.join(UPLOAD_DIR, key);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  return {
    key,
    url: `/api/files/${key}`,
    filename: file.name,
    size: file.size,
    mimeType: file.type,
  };
}

/**
 * Retrieves a file by key.
 */
export async function getFile(key: string): Promise<Buffer> {
  const filePath = path.join(UPLOAD_DIR, key);
  return readFile(filePath);
}

/**
 * Deletes a file by key.
 */
export async function deleteFile(key: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, key);
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}

/**
 * Gets the public URL for a file key.
 */
export function getFileUrl(key: string): string {
  const baseUrl = process.env['NEXTAUTH_URL'] ?? 'http://localhost:3000';
  return `${baseUrl}/api/files/${encodeURIComponent(key)}`;
}
