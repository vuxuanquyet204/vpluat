'use client';

import { create } from 'zustand';

export interface AdminNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'lead_new' | 'booking_upcoming' | 'booking_cancelled' | 'review_new' | 'campaign_sent' | 'system';
  title: string;
  message?: string;
  link?: string;
  icon?: string;
  channels?: ('in_app' | 'email' | 'sms')[];
  read?: boolean;
  duration?: number;
  createdAt?: string;
}

interface AdminUIState {
  // Sidebar
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Active nav
  activeNavId: string;
  setActiveNavId: (id: string) => void;

  // Modals
  activeModal: string | null;
  modalData: Record<string, unknown> | null;
  openModal: (id: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Table selection
  selectedRows: Set<string>;
  toggleRow: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;

  // Filters (persisted per module)
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // In-app notifications (for bell dropdown)
  notifications: AdminNotification[];
  addNotification: (n: AdminNotification) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Impersonation (Phase 7)
  impersonatingUserId: string | null;
  setImpersonating: (userId: string | null) => void;
}

export const useAdminUIStore = create<AdminUIState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  activeNavId: 'dashboard',
  setActiveNavId: (id) => set({ activeNavId: id }),

  activeModal: null,
  modalData: null,
  openModal: (id, data) => set({ activeModal: id, modalData: data ?? null }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  selectedRows: new Set(),
  toggleRow: (id) =>
    set((s) => {
      const next = new Set(s.selectedRows);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedRows: next };
    }),
  selectAll: (ids) => set({ selectedRows: new Set(ids) }),
  clearSelection: () => set({ selectedRows: new Set() }),

  filters: {},
  setFilter: (key, value) =>
    set((s) => ({ filters: { ...s.filters, [key]: value } })),
  clearFilters: () => set({ filters: {} }),

  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  notifications: [],
  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications].slice(0, 50),
    })),
  removeNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
  markNotificationRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllNotificationsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),
  clearNotifications: () => set({ notifications: [] }),

  impersonatingUserId: null,
  setImpersonating: (userId) => set({ impersonatingUserId: userId }),
}));
