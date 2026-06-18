/**
 * MockDB — Singleton in-memory + localStorage persistence
 *
 * Dùng làm lớp dữ liệu cho toàn bộ admin. Mỗi collection là một array
 * các bản ghi có field `id` (string). Tất cả hàm đều đồng bộ, trả về
 * shallow copy để tránh mutation ngoài ý muốn.
 *
 * Persistence key: `vp-luat-admin-db` (JSON)
 * SSR-safe: tự phát hiện window/localStorage.
 */

export type CollectionName =
  | 'leads'
  | 'lead_timeline'
  | 'lead_notes'
  | 'bookings'
  | 'posts'
  | 'post_revisions'
  | 'categories'
  | 'tags'
  | 'services'
  | 'lawyers'
  | 'lawyer_schedules'
  | 'reviews'
  | 'review_reports'
  | 'chatbot_sessions'
  | 'chatbot_intents'
  | 'subscribers'
  | 'campaigns'
  | 'newsletter_templates'
  | 'landing_pages'
  | 'users'
  | 'roles'
  | 'audit_logs'
  | 'notifications'
  | 'settings';

export type CollectionMap = {
  leads: object[];
  lead_timeline: object[];
  lead_notes: object[];
  bookings: object[];
  posts: object[];
  post_revisions: object[];
  categories: object[];
  tags: object[];
  services: object[];
  lawyers: object[];
  lawyer_schedules: object[];
  reviews: object[];
  review_reports: object[];
  chatbot_sessions: object[];
  chatbot_intents: object[];
  subscribers: object[];
  campaigns: object[];
  newsletter_templates: object[];
  landing_pages: object[];
  users: object[];
  roles: object[];
  audit_logs: object[];
  notifications: object[];
  settings: object[];
};

export type SeedData = Partial<CollectionMap>;

const STORAGE_KEY = 'vp-luat-admin-db';
const STORAGE_VERSION_KEY = 'vp-luat-admin-db-version';
const CURRENT_VERSION = 1;

const ALL_COLLECTIONS: CollectionName[] = [
  'leads',
  'lead_timeline',
  'lead_notes',
  'bookings',
  'posts',
  'post_revisions',
  'categories',
  'tags',
  'services',
  'lawyers',
  'lawyer_schedules',
  'reviews',
  'review_reports',
  'chatbot_sessions',
  'chatbot_intents',
  'subscribers',
  'campaigns',
  'newsletter_templates',
  'landing_pages',
  'users',
  'roles',
  'audit_logs',
  'notifications',
  'settings',
];

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function createEmptyDB(): CollectionMap {
  const db = {} as CollectionMap;
  for (const c of ALL_COLLECTIONS) {
    (db as Record<string, unknown[]>)[c] = [];
  }
  return db;
}

function loadFromStorage(): CollectionMap | null {
  if (!isBrowser()) return null;
  try {
    const version = localStorage.getItem(STORAGE_VERSION_KEY);
    if (version !== String(CURRENT_VERSION)) return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CollectionMap;
    // Defensive: ensure every collection exists
    const fresh = createEmptyDB();
    for (const c of ALL_COLLECTIONS) {
      if (Array.isArray(parsed[c])) {
        (fresh as Record<string, unknown[]>)[c] = parsed[c] as unknown[];
      }
    }
    return fresh;
  } catch {
    return null;
  }
}

function saveToStorage(db: CollectionMap): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
  } catch {
    // Quota exceeded — silent
  }
}

class MockDBImpl {
  private db: CollectionMap = createEmptyDB();
  private listeners = new Set<() => void>();
  private initialized = false;

  /**
   * Khởi tạo DB: load từ localStorage, nếu chưa có thì seed từ data truyền vào.
   * Gọi 1 lần từ app shell.
   */
  init(seed: SeedData): void {
    if (this.initialized) return;
    const existing = loadFromStorage();
    if (existing) {
      this.db = existing;
    } else {
      this.db = createEmptyDB();
      for (const c of ALL_COLLECTIONS) {
        const seedArr = (seed as Record<string, unknown[] | undefined>)[c];
        if (Array.isArray(seedArr)) {
          (this.db as Record<string, unknown[]>)[c] = [...seedArr];
        }
      }
      saveToStorage(this.db);
    }
    this.initialized = true;
  }

  /** Subscribe để TanStack Query invalidate khi có thay đổi. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    saveToStorage(this.db);
    for (const l of this.listeners) l();
  }

  /** Lấy toàn bộ collection (readonly copy). */
  getAll<T extends object = object>(name: CollectionName): T[] {
    const arr = (this.db as Record<string, unknown[]>)[name] ?? [];
    return arr as T[];
  }

  /** Lấy 1 bản ghi theo id. */
  getById<T extends object = object>(name: CollectionName, id: string): T | null {
    const arr = this.getAll<T>(name);
    return arr.find((r) => (r as { id?: string }).id === id) ?? null;
  }

  /** Thêm mới 1 bản ghi. Tự gán id + createdAt + updatedAt nếu chưa có. */
  insert<T extends object>(name: CollectionName, record: T): T {
    const now = new Date().toISOString();
    const r = record as Record<string, unknown>;
    const next = {
      ...record,
      id: (r.id as string) ?? generateId(),
      createdAt: (r.createdAt as string) ?? now,
      updatedAt: (r.updatedAt as string) ?? now,
    } as T;
    (this.db as Record<string, unknown[]>)[name].push(next);
    this.notify();
    return next;
  }

  /** Cập nhật 1 bản ghi. Trả về bản ghi mới hoặc null nếu không tìm thấy. */
  update<T extends object>(name: CollectionName, id: string, patch: Partial<T>): T | null {
    const arr = (this.db as Record<string, unknown[]>)[name];
    const idx = arr.findIndex((r) => (r as { id?: string }).id === id);
    if (idx === -1) return null;
    const next = { ...(arr[idx] as T), ...patch, updatedAt: new Date().toISOString() };
    arr[idx] = next;
    this.notify();
    return next;
  }

  /** Xóa 1 bản ghi. Trả về true nếu xóa thành công. */
  delete(name: CollectionName, id: string): boolean {
    const arr = (this.db as Record<string, unknown[]>)[name];
    const idx = arr.findIndex((r) => (r as { id?: string }).id === id);
    if (idx === -1) return false;
    arr.splice(idx, 1);
    this.notify();
    return true;
  }

  /** Xóa nhiều bản ghi cùng lúc (cho bulk action). */
  deleteMany(name: CollectionName, ids: string[]): number {
    const set = new Set(ids);
    const arr = (this.db as Record<string, unknown[]>)[name];
    const before = arr.length;
    (this.db as Record<string, unknown[]>)[name] = arr.filter(
      (r) => !set.has((r as { id?: string }).id as string),
    );
    const removed = before - (this.db as Record<string, unknown[]>)[name].length;
    if (removed > 0) this.notify();
    return removed;
  }

  /** Query collection với filter callback + sort. */
  query<T extends object>(
    name: CollectionName,
    filter?: (record: T) => boolean,
    sort?: { by: keyof T; dir: 'asc' | 'desc' },
  ): T[] {
    let result = this.getAll<T>(name);
    if (filter) result = result.filter(filter);
    if (sort) {
      result = [...result].sort((a, b) => {
        const av = a[sort.by] as unknown;
        const bv = b[sort.by] as unknown;
        if (av == null && bv == null) return 0;
        if (av == null) return 1;
        if (bv == null) return -1;
        if (av < bv) return sort.dir === 'asc' ? -1 : 1;
        if (av > bv) return sort.dir === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }

  /** Đếm bản ghi (có thể filter). */
  count(name: CollectionName, filter?: (record: object) => boolean): number {
    const arr = this.getAll(name);
    return filter ? arr.filter(filter).length : arr.length;
  }

  /** Reset về rỗng (dùng cho nút "Reset to seed" trong Settings). */
  reset(): void {
    this.db = createEmptyDB();
    this.notify();
  }

  /** Reset rồi seed lại từ data mới. */
  reseed(seed: SeedData): void {
    this.db = createEmptyDB();
    for (const c of ALL_COLLECTIONS) {
      const seedArr = (seed as Record<string, unknown[] | undefined>)[c];
      if (Array.isArray(seedArr)) {
        (this.db as Record<string, unknown[]>)[c] = [...seedArr];
      }
    }
    this.notify();
  }

  /** Tính tổng dung lượng (bytes) của DB đang lưu localStorage. */
  sizeInBytes(): number {
    if (!isBrowser()) return 0;
    try {
      return new Blob([localStorage.getItem(STORAGE_KEY) ?? '']).size;
    } catch {
      return 0;
    }
  }
}

let counter = 0;
function generateId(): string {
  counter += 1;
  return `${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const MockDB = new MockDBImpl();
export type { MockDBImpl };
