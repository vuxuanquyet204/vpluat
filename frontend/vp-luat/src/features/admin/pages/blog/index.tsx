'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, FileText, FolderTree, Tag as TagIcon, Download } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AdminPageHeader, SearchBar, FilterTabs, ConfirmDialog } from '@/features/admin/shared';
import {
  useMockQuery,
  useCreate,
  useUpdate,
  useDelete,
  useCan,
  exportToCSV,
  notifySuccess,
  notifyError,
  ghiAudit,
  getCurrentUser,
} from '@/features/admin/lib';
import { MockDB } from '@/features/admin/mock/db';
import { postSchema, categorySchema, tagSchema } from '@/features/admin/schema';
import type {
  BlogPost,
  Category,
  Tag,
  PostStatus,
  PostRevision,
} from '@/features/admin/types';
import { PostsTable } from './components/posts-table';
import { PostEditor } from './components/post-editor';
import { PostPreview } from './components/post-preview';
import { PostCategories } from './components/post-categories';
import { PostTags } from './components/post-tags';
import type { PostFormValues, CategoryFormValues, TagFormValues } from '@/features/admin/schema';

const STATUS_TABS: Array<{ value: 'all' | PostStatus; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Bản nháp' },
  { value: 'published', label: 'Đã đăng' },
  { value: 'scheduled', label: 'Hẹn giờ' },
];

type TabKey = 'posts' | 'categories' | 'tags';

export default function BlogPage() {
  const qc = useQueryClient();
  const canWrite = useCan('blog.write');
  const canPublish = useCan('blog.publish');
  const canDelete = useCan('blog.delete');

  // ─── Data ──────────────────────────────────────────────────────────
  const { data: posts = [], isLoading: postsLoading } = useMockQuery<BlogPost>('posts');
  const { data: categories = [] } = useMockQuery<Category>('categories');
  const { data: tags = [] } = useMockQuery<Tag>('tags');
  const { data: revisions = [] } = useMockQuery<PostRevision>('post_revisions');

  // ─── UI state ─────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabKey>('posts');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const LIMIT = 20;

  // Editor
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<BlogPost | null>(null);

  // Delete confirm
  const [confirmDelete, setConfirmDelete] = useState<BlogPost | null>(null);

  // ─── Stats ────────────────────────────────────────────────────────
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: posts.length };
    for (const s of ['draft', 'published', 'scheduled'] as PostStatus[]) {
      counts[s] = posts.filter((p) => p.status === s).length;
    }
    return counts;
  }, [posts]);

  const tabsWithCounts = STATUS_TABS.map((t) => ({ ...t, count: statusCounts[t.value] ?? 0 }));

  // ─── Filter ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = posts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          (categories.find((c) => c.id === p.category)?.name.toLowerCase().includes(q) ?? false),
      );
    }
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }
    return result;
  }, [posts, search, statusFilter, categories]);

  const paginated = filtered.slice((page - 1) * LIMIT, page * LIMIT);
  const totalPages = Math.max(1, Math.ceil(filtered.length / LIMIT));

  // ─── Mutations ────────────────────────────────────────────────────
  const createPost = useCreate<BlogPost>('posts', 'post');
  const updatePost = useUpdate<BlogPost>('posts', 'post');
  const deletePost = useDelete('posts', 'post');
  const deleteManyPosts = useDelete('posts', 'post');

  const createCategory = useCreate<Category>('categories', 'category');
  const updateCategory = useUpdate<Category>('categories', 'category');
  const deleteCategory = useDelete('categories', 'category');

  const createTag = useCreate<Tag>('tags', 'tag');
  const updateTag = useUpdate<Tag>('tags', 'tag');
  const deleteTag = useDelete('tags', 'tag');

  // ─── Schedule auto-publish (60s interval) ────────────────────────
  useEffect(() => {
    function checkScheduled() {
      const now = Date.now();
      const due = MockDB.getAll<BlogPost>('posts').filter((p) => {
        if (p.status !== 'scheduled' || !p.scheduledAt) return false;
        return new Date(p.scheduledAt).getTime() <= now;
      });
      if (due.length === 0) return;
      for (const p of due) {
        MockDB.update<BlogPost>('posts', p.id, {
          status: 'published',
          publishedAt: new Date().toISOString(),
        });
        ghiAudit({
          action: 'publish',
          entity: 'post',
          entityId: p.id,
          entityLabel: p.title,
          diff: { before: { status: 'scheduled' }, after: { status: 'published' } },
        });
      }
      qc.invalidateQueries({ queryKey: ['admin', 'posts'] });
    }
    checkScheduled();
    const interval = setInterval(checkScheduled, 60_000);
    const onFocus = () => checkScheduled();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [qc]);

  // ─── Handlers: posts ──────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingPost(null);
    setEditorOpen(true);
  }, []);

  const handleOpenEdit = useCallback((post: BlogPost) => {
    setEditingPost(post);
    setEditorOpen(true);
  }, []);

  const handleSavePost = useCallback(
    async (
      values: PostFormValues,
      options: { status: PostStatus; scheduledAt?: string },
    ): Promise<BlogPost> => {
      const user = getCurrentUser();
      const authorName = editingPost?.author ?? user?.name ?? 'Admin';
      const now = new Date().toISOString();
      const isPublishing = options.status === 'published';

      if (editingPost) {
        const before = { ...editingPost };
        const patch: Partial<BlogPost> = {
          ...values,
          status: options.status,
          publishedAt: isPublishing ? now : editingPost.publishedAt,
          scheduledAt: options.scheduledAt,
        };
        const updated = await updatePost.mutateAsync({ id: editingPost.id, patch });
        if (!updated) {
          notifyError('Lỗi', 'Không tìm thấy bài viết');
          throw new Error('Post not found');
        }
        ghiAudit({
          action: isPublishing ? 'publish' : 'update',
          entity: 'post',
          entityId: editingPost.id,
          entityLabel: updated.title,
          diff: { before: before as unknown as Record<string, unknown>, after: updated as unknown as Record<string, unknown> },
        });
        notifySuccess(isPublishing ? 'Đã xuất bản' : 'Đã lưu bài viết');
        // Sau khi edit, set editingPost = updated để lần save sau dùng dữ liệu mới
        setEditingPost(updated);
        return updated;
      }

      // Tạo mới
      const result = (await createPost.mutateAsync({
        ...values,
        status: options.status,
        author: authorName,
        publishedAt: isPublishing ? now : undefined,
        scheduledAt: options.scheduledAt,
      } as unknown as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>)) as BlogPost;
      ghiAudit({
        action: 'create',
        entity: 'post',
        entityId: result.id,
        entityLabel: result.title,
      });
      notifySuccess(isPublishing ? 'Đã tạo & xuất bản' : 'Đã tạo bài viết');
      setEditingPost(result);
      return result;
    },
    [editingPost, createPost, updatePost],
  );

  const handleDeletePost = useCallback(
    (post: BlogPost) => {
      deletePost.mutate(post.id, {
        onSuccess: () => {
          notifySuccess(`Đã xóa bài viết "${post.title}"`);
          // Xóa revisions tương ứng
          const toDelete = MockDB.getAll<PostRevision>('post_revisions')
            .filter((r) => r.postId === post.id)
            .map((r) => r.id);
          if (toDelete.length > 0) MockDB.deleteMany('post_revisions', toDelete);
          qc.invalidateQueries({ queryKey: ['admin', 'post_revisions'] });
        },
        onError: (e) => notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xóa'),
      });
    },
    [deletePost, qc],
  );

  const handleSaveRevision = useCallback((rev: PostRevision) => {
    MockDB.insert<PostRevision>('post_revisions', rev);
    qc.invalidateQueries({ queryKey: ['admin', 'post_revisions'] });
  }, [qc]);

  const getRevisions = useCallback(
    (postId: string) => revisions.filter((r) => r.postId === postId),
    [revisions],
  );

  const handlePublishOne = useCallback(
    async (p: BlogPost) => {
      try {
        const now = new Date().toISOString();
        await updatePost.mutateAsync({
          id: p.id,
          patch: { status: 'published', publishedAt: now },
        });
        ghiAudit({
          action: 'publish',
          entity: 'post',
          entityId: p.id,
          entityLabel: p.title,
        });
        notifySuccess(`Đã xuất bản "${p.title}"`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể xuất bản');
      }
    },
    [updatePost],
  );

  const handleUnpublishOne = useCallback(
    async (p: BlogPost) => {
      try {
        await updatePost.mutateAsync({
          id: p.id,
          patch: { status: 'draft', publishedAt: undefined },
        });
        ghiAudit({
          action: 'update',
          entity: 'post',
          entityId: p.id,
          entityLabel: p.title,
        });
        notifySuccess(`Đã chuyển "${p.title}" về nháp`);
      } catch (e) {
        notifyError('Lỗi', e instanceof Error ? e.message : 'Không thể hủy đăng');
      }
    },
    [updatePost],
  );

  const handleBulkPublish = useCallback(
    (selected: BlogPost[]) => {
      const now = new Date().toISOString();
      Promise.all(
        selected.map((p) =>
          updatePost.mutateAsync({ id: p.id, patch: { status: 'published', publishedAt: now } }),
        ),
      ).then(() => {
        notifySuccess(`Đã xuất bản ${selected.length} bài viết`);
        ghiAudit({
          action: 'publish',
          entity: 'post',
          entityId: selected.map((p) => p.id).join(','),
          entityLabel: `${selected.length} posts`,
        });
      });
    },
    [updatePost],
  );

  const handleBulkUnpublish = useCallback(
    (selected: BlogPost[]) => {
      Promise.all(
        selected.map((p) => updatePost.mutateAsync({ id: p.id, patch: { status: 'draft' } })),
      ).then(() => {
        notifySuccess(`Đã chuyển ${selected.length} bài viết về nháp`);
      });
    },
    [updatePost],
  );

  const handleBulkDelete = useCallback(
    (selected: BlogPost[]) => {
      const ids = selected.map((p) => p.id);
      deleteManyPosts.mutate(ids.join(','), {
        onSuccess: () => {
          notifySuccess(`Đã xóa ${selected.length} bài viết`);
          // Cleanup revisions
          const toDelete = MockDB.getAll<PostRevision>('post_revisions')
            .filter((r) => ids.includes(r.postId))
            .map((r) => r.id);
          if (toDelete.length > 0) MockDB.deleteMany('post_revisions', toDelete);
          qc.invalidateQueries({ queryKey: ['admin', 'post_revisions'] });
        },
      });
    },
    [deleteManyPosts, qc],
  );

  const handleExportCsv = useCallback(() => {
    exportToCSV(
      filtered as unknown as Record<string, unknown>[],
      `posts-${new Date().toISOString().slice(0, 10)}`,
      [
        { key: 'title', header: 'Tiêu đề' },
        { key: 'slug', header: 'Slug' },
        { key: 'category', header: 'Danh mục ID' },
        { key: 'status', header: 'Trạng thái' },
        { key: 'author', header: 'Tác giả' },
        { key: 'publishedAt', header: 'Ngày đăng' },
        { key: 'scheduledAt', header: 'Hẹn giờ' },
        { key: 'createdAt', header: 'Ngày tạo' },
      ],
    );
    notifySuccess(`Đã export ${filtered.length} bài viết ra CSV`);
  }, [filtered]);

  // ─── Handlers: categories ─────────────────────────────────────────
  const handleCreateCategory = useCallback(
    async (values: CategoryFormValues) => {
      await createCategory.mutateAsync({
        ...values,
        postCount: 0,
        createdAt: new Date().toISOString(),
      } as unknown as Omit<Category, 'id' | 'createdAt' | 'updatedAt'>);
      notifySuccess('Đã tạo danh mục');
    },
    [createCategory],
  );

  const handleUpdateCategory = useCallback(
    async (id: string, values: CategoryFormValues) => {
      await updateCategory.mutateAsync({ id, patch: values });
      notifySuccess('Đã cập nhật danh mục');
    },
    [updateCategory],
  );

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      const cat = categories.find((c) => c.id === id);
      if (cat && cat.postCount > 0) {
        notifyError('Không thể xóa', `Danh mục còn ${cat.postCount} bài viết.`);
        return;
      }
      deleteCategory.mutate(id, {
        onSuccess: () => notifySuccess('Đã xóa danh mục'),
      });
    },
    [deleteCategory, categories],
  );

  // ─── Handlers: tags ───────────────────────────────────────────────
  const handleCreateTag = useCallback(
    async (values: TagFormValues) => {
      await createTag.mutateAsync({
        ...values,
        postCount: 0,
        createdAt: new Date().toISOString(),
      } as unknown as Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>);
      notifySuccess('Đã tạo tag');
    },
    [createTag],
  );

  const handleUpdateTag = useCallback(
    async (id: string, values: TagFormValues) => {
      await updateTag.mutateAsync({ id, patch: values });
      notifySuccess('Đã cập nhật tag');
    },
    [updateTag],
  );

  const handleDeleteTag = useCallback(
    async (id: string) => {
      const t = tags.find((x) => x.id === id);
      if (t && t.postCount > 0) {
        notifyError('Không thể xóa', `Tag còn ${t.postCount} bài viết.`);
        return;
      }
      deleteTag.mutate(id, {
        onSuccess: () => notifySuccess('Đã xóa tag'),
      });
    },
    [deleteTag, tags],
  );

  const currentUser = getCurrentUser();
  const authorName = currentUser?.name ?? 'Admin';

  // Track last editor save time for editor button states
  const editorSaving = createPost.isPending || updatePost.isPending;

  // Track filter to prevent unused warnings
  void postSchema;
  void categorySchema;
  void tagSchema;

  return (
    <div className="admin-view">
      <AdminPageHeader
        title="Bài viết & Blog"
        subtitle={`Quản lý ${posts.length} bài viết, ${categories.length} danh mục, ${tags.length} tag`}
        actions={
          tab === 'posts' && canWrite ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="action-btn"
                onClick={handleExportCsv}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                disabled={filtered.length === 0}
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                type="button"
                className="action-btn action-btn--primary"
                onClick={handleOpenCreate}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Plus size={14} /> Tạo bài viết
              </button>
            </div>
          ) : null
        }
      />

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          marginBottom: 16,
          borderBottom: '1px solid var(--gray-200)',
        }}
      >
        {[
          { key: 'posts', label: 'Bài viết', icon: <FileText size={14} />, count: posts.length },
          { key: 'categories', label: 'Danh mục', icon: <FolderTree size={14} />, count: categories.length },
          { key: 'tags', label: 'Tags', icon: <TagIcon size={14} />, count: tags.length },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key as TabKey)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              border: 'none',
              background: 'transparent',
              borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--gray-600)',
              fontWeight: tab === t.key ? 600 : 500,
              cursor: 'pointer',
              fontSize: '0.85rem',
              marginBottom: -1,
            }}
            aria-pressed={tab === t.key}
          >
            {t.icon}
            {t.label}
            <span
              style={{
                background: tab === t.key ? 'var(--primary)' : 'var(--gray-100)',
                color: tab === t.key ? 'white' : 'var(--gray-500)',
                padding: '1px 6px',
                borderRadius: 999,
                fontSize: '0.7rem',
                fontWeight: 600,
                minWidth: 20,
                textAlign: 'center',
              }}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'posts' && (
        <div className="admin-card">
          <div
            style={{
              marginBottom: 12,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <SearchBar
              value={search}
              onChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Tìm theo tiêu đề, slug, danh mục..."
            />
            <span style={{ color: 'var(--gray-400)', fontSize: '0.8rem' }}>
              Hiển thị {paginated.length} / {filtered.length}
            </span>
          </div>

          <FilterTabs
            tabs={tabsWithCounts}
            activeValue={statusFilter}
            onChange={(v) => {
              setStatusFilter(v as 'all' | PostStatus);
              setPage(1);
            }}
          />

          <PostsTable
            data={paginated}
            isLoading={postsLoading}
            categories={categories}
            tags={tags}
            selectedIds={selectedIds}
            onSelectChange={setSelectedIds}
            onEdit={handleOpenEdit}
            onDelete={(p) => canDelete && setConfirmDelete(p)}
            onPreview={(p) => {
              setPreviewPost(p);
              setPreviewOpen(true);
            }}
            onPublish={canPublish ? handlePublishOne : undefined}
            onUnpublish={canWrite ? handleUnpublishOne : undefined}
            canPublish={canPublish}
            canDelete={canDelete}
          />

          {selectedIds.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 12px',
                background: 'var(--gray-900)',
                color: 'white',
                borderRadius: 'var(--radius-md, 6px)',
                marginTop: 8,
                fontSize: '0.8rem',
              }}
            >
              <span>Đã chọn {selectedIds.length} bài viết</span>
              <div style={{ flex: 1 }} />
              {canPublish && (
                <button
                  type="button"
                  className="action-btn"
                  style={{
                    background: 'var(--success, #059669)',
                    color: 'white',
                    borderColor: 'var(--success, #059669)',
                  }}
                  onClick={() => {
                    const selected = paginated.filter((p) => selectedIds.includes(p.id));
                    handleBulkPublish(selected);
                    setSelectedIds([]);
                  }}
                >
                  Xuất bản
                </button>
              )}
              {canWrite && (
                <button
                  type="button"
                  className="action-btn"
                  style={{
                    background: 'var(--warning, #D97706)',
                    color: 'white',
                    borderColor: 'var(--warning, #D97706)',
                  }}
                  onClick={() => {
                    const selected = paginated.filter((p) => selectedIds.includes(p.id));
                    handleBulkUnpublish(selected);
                    setSelectedIds([]);
                  }}
                >
                  Chuyển nháp
                </button>
              )}
              {canDelete && (
                <button
                  type="button"
                  className="action-btn"
                  style={{ background: '#DC2626', color: 'white', borderColor: '#DC2626' }}
                  onClick={() => {
                    const selected = paginated.filter((p) => selectedIds.includes(p.id));
                    handleBulkDelete(selected);
                    setSelectedIds([]);
                  }}
                >
                  Xóa
                </button>
              )}
              <button
                type="button"
                className="action-btn"
                style={{
                  background: 'transparent',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                }}
                onClick={() => setSelectedIds([])}
              >
                Hủy
              </button>
            </div>
          )}

          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 12,
                fontSize: '0.82rem',
                color: 'var(--gray-500)',
              }}
            >
              <span>
                Trang {page} / {totalPages} · {filtered.length} bài viết
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  ‹ Trước
                </button>
                <button
                  type="button"
                  className="action-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Sau ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'categories' && (
        <PostCategories
          categories={categories}
          onCreate={handleCreateCategory}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
          isCreating={createCategory.isPending}
          isUpdating={updateCategory.isPending}
          isDeleting={deleteCategory.isPending}
        />
      )}

      {tab === 'tags' && (
        <PostTags
          tags={tags}
          onCreate={handleCreateTag}
          onUpdate={handleUpdateTag}
          onDelete={handleDeleteTag}
          isCreating={createTag.isPending}
          isUpdating={updateTag.isPending}
          isDeleting={deleteTag.isPending}
        />
      )}

      {/* Post editor modal full-screen */}
      <PostEditor
        key={editingPost?.id ?? 'new'}
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingPost(null);
        }}
        post={editingPost}
        categories={categories}
        tags={tags}
        onSave={handleSavePost}
        getRevisions={getRevisions}
        onSaveRevision={handleSaveRevision}
        isSaving={editorSaving}
        authorName={authorName}
      />

      {/* Preview modal */}
      <PostPreview
        isOpen={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          setPreviewPost(null);
        }}
        post={previewPost}
        category={categories.find((c) => c.id === previewPost?.category) ?? null}
        tags={tags}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            handleDeletePost(confirmDelete);
            setConfirmDelete(null);
          }
        }}
        title="Xóa bài viết"
        message={
          confirmDelete
            ? `Bạn có chắc muốn xóa bài viết "${confirmDelete.title}"? Hành động này không thể hoàn tác.`
            : ''
        }
        confirmLabel="Xóa"
        variant="danger"
        isLoading={deletePost.isPending}
      />
    </div>
  );
}
