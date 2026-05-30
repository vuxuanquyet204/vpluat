import { create } from "zustand";

interface Toast {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
}

interface UIState {
    // Sidebar
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;

    // Modal
    activeModal: string | null;
    modalProps: Record<string, unknown>;
    openModal: (modalId: string, props?: Record<string, unknown>) => void;
    closeModal: () => void;

    // Toast
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
    
    // Theme
    theme: 'light' | 'dark' | 'system';
    setTheme: (theme: UIState['theme']) => void;

    // Mobile menu
    mobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
    sidebarOpen: true,
    sidebarCollapsed: false,
    toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
    activeModal: null,
    modalProps: {},
    openModal: (modalId, props = {}) => set({ activeModal: modalId, modalProps: props }),
    closeModal: () => set({ activeModal: null, modalProps: {} }),
  
    toasts: [],
    addToast: (toast) => set(state => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }]
    })),
    removeToast: (id) => set(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    })),
  
    theme: 'system',
    setTheme: (theme) => {
      document.documentElement.classList.remove('light', 'dark');
      if (theme !== 'system') {
        document.documentElement.classList.add(theme);
      }
      set({ theme });
    },
  
    mobileMenuOpen: false,
    toggleMobileMenu: () => set(state => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  }));