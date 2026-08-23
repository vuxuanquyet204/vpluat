'use client';

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '@/lib/api/hooks';
import { postApi, type Post } from '@/lib/api/admin-content';
import { ghiAudit, notifySuccess, notifyError } from '../../../lib';

export function useCreatePost() {
  const qc = useQueryClient();
  const mutation = useApiMutation<Post, Partial<Post>>('POST', '/admin/posts');

  return useCallback(
    async (data: Partial<Post>) => {
      try {
        const created = await mutation.mutateAsync(data);
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
        // Record the initial revision automatically.
        postApi.recordRevision(created.id, 'created').catch(() => {
          /* best-effort: revision recording is non-blocking */
        });
        ghiAudit({
          action: 'create',
          entity: 'post',
          entityId: created.id,
          entityLabel: created.title ?? created.slug,
        });
        notifySuccess('Đã tạo bài viết');
        return created;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo');
        throw e;
      }
    },
    [mutation, qc],
  );
}

export function useUpdatePost() {
  const qc = useQueryClient();
  // Backend exposes PUT /api/admin/posts/{id} for full update. We use PUT
  // (not PATCH) to match the existing PostController.updatePost mapping.
  //
  // The mutation is invoked with `{ id, body }` so that useApiMutation's PUT
  // branch forwards `body` directly as the request payload (it strips `id`
  // for `{ id, body }` and `{ id, ...rest }` shapes but does NOT know about
  // the legacy `{ id, values }` alias). Sending the raw patch as `body`
  // avoids the "Unrecognized field values" rejection the controller throws.
  const mutation = useApiMutation<Post, { id: string; body: Partial<Post> }>(
    'PUT',
    (vars) => `/admin/posts/${vars.id}`,
  );

  return useCallback(
    async (vars: { id: string; patch: Partial<Post> }) => {
      try {
        const updated = await mutation.mutateAsync({
          id: vars.id,
          body: vars.patch,
        });
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
        postApi.recordRevision(vars.id, 'edit').catch(() => undefined);
        ghiAudit({
          action: 'update',
          entity: 'post',
          entityId: vars.id,
          entityLabel: updated.title ?? updated.slug,
        });
        return updated;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể cập nhật');
        throw e;
      }
    },
    [mutation, qc],
  );
}

export function usePublishPost() {
  const qc = useQueryClient();
  const mutation = useApiMutation<Post, string>(
    'PATCH',
    (id) => `/admin/posts/${id}/publish`,
  );

  return useCallback(
    async (id: string) => {
      try {
        const result = await mutation.mutateAsync(id);
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
        ghiAudit({
          action: 'publish',
          entity: 'post',
          entityId: id,
          entityLabel: result.title ?? result.slug,
          diff: { before: { status: 'DRAFT' }, after: { status: 'PUBLISHED' } },
        });
        notifySuccess('Đã xuất bản', result.title ?? result.slug);
        return result;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xuất bản');
        throw e;
      }
    },
    [mutation, qc],
  );
}

export function useArchivePost() {
  const qc = useQueryClient();
  const mutation = useApiMutation<Post, string>(
    'PATCH',
    (id) => `/admin/posts/${id}/archive`,
  );
  return useCallback(
    async (id: string) => {
      const result = await mutation.mutateAsync(id);
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      notifySuccess('Đã lưu trữ', result.title ?? result.slug);
      return result;
    },
    [mutation, qc],
  );
}

/**
 * Schedule a post for future publishing.
 * Backend endpoint: PATCH /admin/posts/{id}/schedule?at={isoInstant}
 */
export function useSchedulePost() {
  const qc = useQueryClient();
  const mutation = useApiMutation<Post, { id: string; at: string }>(
    'PATCH',
    (vars) => `/admin/posts/${vars.id}/schedule`,
  );

  return useCallback(
    async (vars: { id: string; scheduledAt: string }) => {
      try {
        const updated = await mutation.mutateAsync({ id: vars.id, at: vars.scheduledAt });
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
        ghiAudit({
          action: 'update',
          entity: 'post',
          entityId: vars.id,
          entityLabel: updated.title ?? updated.slug,
          diff: { before: { status: 'DRAFT' }, after: { status: 'SCHEDULED', scheduledAt: vars.scheduledAt } },
        });
        notifySuccess('Đã lên lịch xuất bản');
        return updated;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể lên lịch');
        throw e;
      }
    },
    [mutation, qc],
  );
}

export function useDeletePost() {
  const qc = useQueryClient();
  const mutation = useApiMutation<void, string>(
    'DELETE',
    (id) => `/admin/posts/${id}`,
  );

  return useCallback(
    async (id: string) => {
      try {
        await mutation.mutateAsync(id);
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
        ghiAudit({ action: 'delete', entity: 'post', entityId: id });
        notifySuccess('Đã xóa bài viết');
        return true;
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa');
        return false;
      }
    },
    [mutation, qc],
  );
}

/**
 * Restore the post to a previous revision. The backend handles the
 * actual restore logic — we just trigger it and refresh the cache.
 */
export function useRestoreRevision() {
  const qc = useQueryClient();
  const mutation = useApiMutation<void, { postId: string; revisionId: string }>(
    'POST',
    (vars) => `/admin/posts/${vars.postId}/revisions/${vars.revisionId}/restore`,
  );

  return useCallback(
    async (vars: { postId: string; revisionId: string }) => {
      try {
        await mutation.mutateAsync(vars);
        qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
        qc.invalidateQueries({ queryKey: ['admin', 'post-revisions', vars.postId] });
        ghiAudit({
          action: 'restore',
          entity: 'post',
          entityId: vars.postId,
          entityLabel: `revision ${vars.revisionId}`,
        });
        notifySuccess('Đã khôi phục revision');
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể khôi phục');
        throw e;
      }
    },
    [mutation, qc],
  );
}

/** Re-export so existing call sites can keep `useDeleteMany` semantics. */
export function useDeleteManyPosts() {
  const qc = useQueryClient();
  return useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => postApi.delete(id)));
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      notifySuccess(`Đã xóa ${ids.length} bài viết`);
      ghiAudit({
        action: 'delete',
        entity: 'post',
        entityId: 'bulk',
        entityLabel: `${ids.length} posts`,
      });
    },
    [qc],
  );
}