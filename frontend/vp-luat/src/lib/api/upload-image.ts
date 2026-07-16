// lib/api/upload-image.ts
// Helper for uploading an image file to the backend admin endpoint.
// Returns the URL (e.g. "/files/images/2026/07/<uuid>.png") that can be
// safely stored in Post.thumbnailUrl / Post.ogImageUrl / TipTap image src.

import { apiClient } from '@/lib/api/client';

export interface UploadedImage {
  url: string;
  publicId: string;
  size: number;
}

/**
 * Upload an image file to the backend via multipart/form-data.
 *
 * Endpoint: `POST /api/admin/upload/image` (admin-only, JWT required).
 * Returns the path of the saved file as `data.url`.
 *
 * The returned URL is safe to send back as `thumbnailUrl` /
 * `ogImageUrl` because `PostRequest` allows `/files/...` paths.
 *
 * Important: we MUST delete the default `Content-Type: application/json`
 * header set on `apiClient`. If we leave it, axios won't auto-derive
 * `multipart/form-data; boundary=...` and Spring will reject the
 * request with `MultipartException: Current request is not a multipart
 * request`.
 */
export async function uploadImage(
  file: File,
  folder = 'images',
): Promise<UploadedImage> {
  const form = new FormData();
  form.append('file', file);
  form.append('folder', folder);
  const res = await apiClient.post<
    (UploadedImage & { success?: boolean; data?: UploadedImage }) | undefined
  >('/admin/upload/image', form, {
    // Drop the JSON default so axios/browser will set the proper
    // `multipart/form-data; boundary=...` header for FormData bodies.
    headers: { 'Content-Type': undefined },
  });
  const body = res.data;
  if (body && 'data' in body && body.data) return body.data;
  return {
    url: body?.url ?? '',
    publicId: body?.publicId ?? '',
    size: body?.size ?? 0,
  };
}
