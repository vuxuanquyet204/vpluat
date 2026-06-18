'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MockDB } from '../../../mock/db';
import { ghiAudit, notifySuccess, notifyError } from '../../../lib';
import type { BlogPost, PostRevision } from '../../../types';

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const statusData: Partial<BlogPost> = { ...data };
      if (data.status === 'published' && !data.publishedAt) {
        statusData.publishedAt = now;
      }
      const created = MockDB.insert<BlogPost>('posts', statusData as BlogPost);
      // Tạo revision đầu tiên
      MockDB.insert<PostRevision>('post_revisions', {
        id: `rev-${Date.now()}`,
        postId: created.id,
        title: created.title,
        content: created.content,
        excerpt: created.excerpt,
        author: created.author,
        reason: 'created',
        createdAt: now,
      });
      ghiAudit({ action: 'create', entity: 'post', entityId: created.id, entityLabel: created.title });
      return created;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'post_revisions'] });
      notifySuccess('Đã tạo bài viết');
    },
    onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể tạo'),
  });
}

export function useUpdatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<BlogPost>; createRevision?: boolean }) => {
      const before = MockDB.getById<BlogPost>('posts', vars.id);
      const updated = MockDB.update<BlogPost>('posts', vars.id, vars.patch);

      // Auto tạo revision khi content/title thay đổi
      if (vars.createRevision !== false && before && (before.content !== vars.patch.content || before.title !== vars.patch.title)) {
        MockDB.insert<PostRevision>('post_revisions', {
          id: `rev-${Date.now()}`,
          postId: vars.id,
          title: updated?.title ?? before.title,
          content: updated?.content ?? before.content,
          excerpt: updated?.excerpt ?? before.excerpt,
          author: updated?.author ?? before.author,
          reason: 'edit',
          createdAt: new Date().toISOString(),
        });
      }

      ghiAudit({ action: 'update', entity: 'post', entityId: vars.id, entityLabel: updated?.title });
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'post_revisions'] });
    },
  });
}

export function usePublishPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const before = MockDB.getById<BlogPost>('posts', id);
      const updated = MockDB.update<BlogPost>('posts', id, {
        status: 'published',
        publishedAt: new Date().toISOString(),
        scheduledAt: undefined,
      });
      ghiAudit({
        action: 'publish',
        entity: 'post',
        entityId: id,
        entityLabel: updated?.title,
        diff: { before: { status: before?.status }, after: { status: 'published' } },
      });
      return updated;
    },
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      notifySuccess('Đã xuất bản', p?.title);
    },
  });
}

export function useSchedulePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: string; scheduledAt: string }) => {
      const updated = MockDB.update<BlogPost>('posts', vars.id, {
        status: 'scheduled',
        scheduledAt: vars.scheduledAt,
      });
      ghiAudit({
        action: 'update',
        entity: 'post',
        entityId: vars.id,
        entityLabel: updated?.title,
        diff: { before: { status: 'draft' }, after: { status: 'scheduled', scheduledAt: vars.scheduledAt } },
      });
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      notifySuccess('Đã lên lịch xuất bản');
    },
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const before = MockDB.getById<BlogPost>('posts', id);
      const ok = MockDB.delete('posts', id);
      if (ok) ghiAudit({ action: 'delete', entity: 'post', entityId: id, entityLabel: before?.title });
      return ok;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      notifySuccess('Đã xóa bài viết');
    },
  });
}

export function useRestoreRevision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { postId: string; revisionId: string }) => {
      const rev = MockDB.getById<PostRevision>('post_revisions', vars.revisionId);
      if (!rev) throw new Error('Revision không tồn tại');
      // Tạo revision mới ghi lại trạng thái trước khi restore
      const before = MockDB.getById<BlogPost>('posts', vars.postId);
      if (before) {
        MockDB.insert<PostRevision>('post_revisions', {
          id: `rev-${Date.now()}`,
          postId: vars.postId,
          title: before.title,
          content: before.content,
          excerpt: before.excerpt,
          author: before.author,
          reason: 'before-restore',
          createdAt: new Date().toISOString(),
        });
      }
      const updated = MockDB.update<BlogPost>('posts', vars.postId, {
        title: rev.title,
        content: rev.content,
        excerpt: rev.excerpt,
      });
      ghiAudit({ action: 'restore', entity: 'post', entityId: vars.postId, entityLabel: updated?.title });
      return updated;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
      qc.invalidateQueries({ queryKey: ['admin', 'post_revisions'] });
      notifySuccess('Đã khôi phục revision');
    },
  });
}
