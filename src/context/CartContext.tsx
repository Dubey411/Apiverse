'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';

import { getOfficialProviderUrl, getUnifiedApiBySlug } from '@/lib/apiMarketplaceData';

const STORAGE_KEY = 'apiverse-shortlist';

export interface CartItem {
  slug: string;
  provider: string;
  product: string;
  category: string;
  mark: string;
  markClassName: string;
  access: string;
  description: string;
  officialUrl: string;
  bestFor: string[];
}

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  itemCount: number;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addApi: (slug: string, options?: { silent?: boolean }) => void;
  removeApi: (slug: string) => void;
  clearCart: () => void;
  hasItem: (slug: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function buildShortlistItem(slug: string) {
  const unifiedApi = getUnifiedApiBySlug(slug);

  if (!unifiedApi) {
    return null;
  }

  const { catalog } = unifiedApi;

  return {
    slug,
    provider: catalog.provider,
    product: catalog.product,
    category: catalog.category,
    mark: catalog.mark,
    markClassName: catalog.markClassName,
    access: catalog.access,
    description: catalog.description,
    officialUrl: getOfficialProviderUrl(slug, catalog.provider),
    bestFor: catalog.bestFor.slice(0, 3),
  } satisfies CartItem;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawShortlist = window.localStorage.getItem(STORAGE_KEY);

      if (rawShortlist) {
        const parsedShortlist = JSON.parse(rawShortlist) as CartItem[];
        setItems(parsedShortlist);
      }
    } catch {
      setItems([]);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((current) => !current), []);

  const addApi = useCallback((slug: string, options?: { silent?: boolean }) => {
    const shortlistItem = buildShortlistItem(slug);

    if (!shortlistItem) {
      toast.error('We could not save this API right now.');
      return;
    }

    setItems((currentItems) => {
      if (currentItems.some((item) => item.slug === slug)) {
        return currentItems;
      }

      return [...currentItems, shortlistItem];
    });

    if (!options?.silent) {
      toast.success(`${shortlistItem.product} saved to shortlist.`);
    }
  }, []);

  const removeApi = useCallback((slug: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.slug !== slug));
    toast.success('API removed from shortlist.');
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const hasItem = useCallback((slug: string) => items.some((item) => item.slug === slug), [items]);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      hydrated,
      itemCount: items.length,
      openCart,
      closeCart,
      toggleCart,
      addApi,
      removeApi,
      clearCart,
      hasItem,
    }),
    [addApi, clearCart, closeCart, hasItem, hydrated, isOpen, items, openCart, removeApi, toggleCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider.');
  }

  return context;
}
