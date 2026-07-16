'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, FileText, FolderTree, Tag as TagIcon, Download } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AdminPageHeader, SearchBar, FilterTabs, ConfirmDialog } from '@/features/admin/shared';
import {
  useCan,
  exportToCSV,
  notifySuccess,
  notifyError,
  ghiAudit,
  getCurrentUser,
} from '@/features/admin/lib';
import { postSchema, categorySchema, tagSchema } from '@/features/admin/schema';
import type {
  BlogPost,
  Category,
  Tag,
  PostStatus,
  PostRevision,
} from '@/features/admin/types';
import { useCreatePost, useUpdatePost, usePublishPost, useSchedulePost, useDeletePost, useDeleteManyPosts, useRestoreRevision } from './hooks/use-post-mutations';
import type { Post } from '@/lib/api/admin-content';
import { usePosts } from './hooks/use-posts';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from './hooks/use-categories';
import {
  useTags,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
} from './hooks/use-tags';
import { usePostRevisions } from './hooks/use-post-revisions';
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

  // ─── UI state ─────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabKey>('posts');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PostStatus>('all');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const LIMIT = 20;

  // ─── Data (now driven by the real backend) ────────────────────────
  const apiPosts = usePosts({
    status: statusFilter === 'all'
      ? undefined
      : (statusFilter === 'draft'
          ? 'DRAFT'
          : statusFilter === 'published'
          ? 'PUBLISHED'
          : 'ARCHIVED'),
  });
  const posts = apiPosts as unknown as BlogPost[];
  const postsLoading = false;
  const categories = useCategories() as unknown as Category[];
  const tags = useTags() as unknown as Tag[];
  const revisions = usePostRevisions('') as unknown as PostRevision[];

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

  // ─── Mutations (all routed through the backend API) ────────────────
  const _createPost = useCreatePost();
  const _updatePost = useUpdatePost();
  const _deletePost = useDeletePost();
  const _deleteManyPosts = useDeleteManyPosts();

  const _createCategory = useCreateCategory();
  const _updateCategory = useUpdateCategory();
  const _deleteCategory = useDeleteCategory();
  const _createTag = useCreateTag();
  const _updateTag = useUpdateTag();
  const _deleteTag = useDeleteTag();

  // Compatibility shims — keep the existing call sites which still use
  // the legacy `.mutateAsync(input)` / `.mutate(id, { onSuccess })`
  // react-query style.
  const createPost = {
    mutateAsync: async (input: Partial<BlogPost>) => {
      const created = await _createPost(input as unknown as Parameters<typeof _createPost>[0]);
      return created as unknown as BlogPost | undefined;
    },
    get isPending() {
      return false;
    },
  };
  const updatePost = {
    mutateAsync: async (input: { id: string; patch: Partial<BlogPost> }) => {
      const updated = await _updatePost({
        id: input.id,
        patch: input.patch as unknown as Parameters<typeof _updatePost>[0]['patch'],
      });
      return (updated as unknown as BlogPost | undefined) ?? null;
    },
    get isPending() {
      return false;
    },
  };
  const deletePost = {
    mutate: (id: string, opts: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
      _deletePost(id)
        .then(() => opts.onSuccess?.())
        .catch((e) => opts.onError?.(e));
    },
    get isPending() {
      return false;
    },
  };
  const deleteManyPosts = {
    mutate: (ids: string, opts: { onSuccess?: () => void }) => {
      const list = ids.split(',');
      _deleteManyPosts(list).then(() => opts.onSuccess?.());
    },
  };

  // Wrap the category/tag callbacks to expose the same
  // `mutate/mutateAsync/isPending` surface the rest of the page expects.
  const wrappedCallback = <T extends (...args: never[]) => Promise<unknown>>(fn: T) => ({
    mutateAsync: fn,
    mutate: ((...args: Parameters<T>) => {
      void fn(...args);
    }) as unknown as (...args: Parameters<T>) => void,
    get isPending() {
      return false;
    },
  });

  const createCategory = wrappedCallback(_createCategory);
  const updateCategory = wrappedCallback(_updateCategory);
  const deleteCategory = {
    mutate: (id: string, opts: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
      _deleteCategory(id)
        .then((ok) => {
          if (ok) opts.onSuccess?.();
        })
        .catch((e) => opts.onError?.(e));
    },
    get isPending() {
      return false;
    },
  };
  const createTag = wrappedCallback(_createTag);
  const updateTag = wrappedCallback(
    _updateTag as unknown as (v: { id: string; patch: { name?: string; slug?: string } }) => Promise<unknown>,
  );
  const deleteTag = {
    mutate: (id: string, opts: { onSuccess?: () => void; onError?: (e: unknown) => void }) => {
      _deleteTag(id)
        .then((ok) => {
          if (ok) opts.onSuccess?.();
        })
        .catch((e) => opts.onError?.(e));
    },
    get isPending() {
      return false;
    },
  };

  // Schedule auto-publish used to be a 60s client-side loop reading the
  // MockDB. The backend now owns scheduling so we keep this effect as a
  // no-op (just the cleanup function) to maintain behaviour parity.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  useEffect(() => () => {}, [qc]);

  // ─── Handlers: posts ──────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditingPost(null);
    setEditorOpen(true);
  }, []);

  const handleOpenEdit = useCallback((post: BlogPost) => {
    setEditingPost(post);
    setEditorOpen(true);
  }, []);

  // UI status (PostStatus = 'draft'|'published'|'scheduled') must be normalized
  // to backend enum (DRAFT|PUBLISHED|SCHEDULED) before hitting the API. Without
  // this Spring throws "No enum constant PostStatus.published".
  const toBackendStatus = (s: PostStatus): 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' => {
    if (s === 'published') return 'PUBLISHED';
    if (s === 'scheduled') return 'SCHEDULED';
    return 'DRAFT';
  };

  const handleSavePost = useCallback(
    async (
      values: PostFormValues,
      options: { status: PostStatus; scheduledAt?: string },
    ): Promise<BlogPost> => {
      const user = getCurrentUser();
      const authorName = editingPost?.author ?? user?.name ?? 'Admin';
      const now = new Date().toISOString();
      const isPublishing = options.status === 'published';
      const apiStatus = toBackendStatus(options.status);

      if (editingPost) {
        const before = { ...editingPost };
        // Map legacy editor fields (category + tag UUIDs) onto the
        // PostRequest shape the backend actually expects (categoryId + slug
        // strings for tags). Without this remap Spring rejects the request
        // with "Unrecognized field category".
        const patch: Record<string, unknown> = {
          ...values,
          status: apiStatus,
          publishedAt: isPublishing ? now : editingPost.publishedAt,
          scheduledAt: options.scheduledAt,
        };
        if ('category' in patch) {
          const catId = (patch as { category?: string }).category;
          delete (patch as Record<string, unknown>).category;
          if (catId) (patch as Record<string, unknown>).categoryId = catId;
        }
        if ('tags' in patch && Array.isArray(patch.tags)) {
          patch.tags = (patch.tags as unknown as string[]).map((t) => {
            const match = tags.find((tg) => tg.id === t);
            return match?.slug ?? t;
          });
        }
        if ('thumbnail' in patch) {
          const thumb = (patch as { thumbnail?: string }).thumbnail;
          delete (patch as Record<string, unknown>).thumbnail;
          if (thumb) (patch as Record<string, unknown>).thumbnailUrl = thumb;
        }
        if ('author' in patch) {
          delete (patch as Record<string, unknown>).author;
        }
        if (values.seo) {
          (patch as Record<string, unknown>).metaTitle = values.seo.metaTitle;
          (patch as Record<string, unknown>).metaDesc = values.seo.metaDescription;
          (patch as Record<string, unknown>).ogImageUrl = values.seo.ogImage;
          // Drop the legacy seo envelope so the backend doesn't see unknown fields.
          delete (patch as Record<string, unknown>).seo;
        }
        const updated = await updatePost.mutateAsync({
          id: editingPost.id,
          patch: patch as unknown as Partial<BlogPost>,
        });
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
      const newPostValues: Record<string, unknown> = {
        ...values,
        status: apiStatus,
        author: authorName,
        publishedAt: isPublishing ? now : undefined,
        scheduledAt: options.scheduledAt,
      };
      // Map legacy editor fields (category + tag UUIDs + thumbnail + seo
      // + author) onto the PostRequest shape the backend actually expects.
      // Without this remap Spring rejects with "Unrecognized field
      // category/thumbnail/author". authorId comes from the JWT, not the body.
      if ('category' in newPostValues) {
        const catId = newPostValues.category as string | undefined;
        delete newPostValues.category;
        if (catId) newPostValues.categoryId = catId;
      }
      if (Array.isArray(newPostValues.tags)) {
        newPostValues.tags = (newPostValues.tags as unknown as string[]).map((t) => {
          const match = tags.find((tg) => tg.id === t);
          return match?.slug ?? t;
        });
      }
      if ('thumbnail' in newPostValues) {
        const thumb = newPostValues.thumbnail as string | undefined;
        delete newPostValues.thumbnail;
        if (thumb) newPostValues.thumbnailUrl = thumb;
      }
      if ('author' in newPostValues) {
        delete newPostValues.author;
      }
      if (values.seo) {
        newPostValues.metaTitle = values.seo.metaTitle;
        newPostValues.metaDesc = values.seo.metaDescription;
        newPostValues.ogImageUrl = values.seo.ogImage;
        delete newPostValues.seo;
      }
      const result = (await createPost.mutateAsync(
        newPostValues as unknown as Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>,
      )) as BlogPost;
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
          // Revisions are deleted server-side as part of the post delete.
          qc.invalidateQueries({ queryKey: ['admin', 'post-revisions'] });
        },
      });
    },
    [deletePost, qc],
  );

  /** Save a revision snapshot. Backend does not yet support this so we
   *  no-op while keeping the API compatible. */
  const handleSaveRevision = useCallback((_rev: PostRevision) => {
    // no-op
  }, []);

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
          patch: { status: 'PUBLISHED', publishedAt: now } as unknown as Partial<BlogPost>,
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
          patch: { status: 'DRAFT', publishedAt: undefined } as unknown as Partial<BlogPost>,
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
          qc.invalidateQueries({ queryKey: ['admin', 'post-revisions'] });
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
