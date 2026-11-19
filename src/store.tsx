import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { byId, Category, setCatalog } from './data';
import { fetchProducts, shopifyEnabled } from './shopify';
import { Lang, STRINGS, Strings } from './i18n';

export type Route =
  | { name: 'home' }
  | { name: 'shop'; cat: Category | 'all' }
  | { name: 'product'; id: string }
  | { name: 'search' }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'done'; ref: string };

export type CartLine = { key: string; id: string; qty: number; picks?: string[] };

/** demo = no Shopify settings; live = products loaded from Shopify. */
export type CatalogState = 'demo' | 'loading' | 'live' | 'error';

type Ctx = {
  catalog: CatalogState;
  reloadCatalog: () => void;
  lang: Lang;
  rtl: boolean;
  t: Strings;
  toggleLang: () => void;
  route: Route;
  canGoBack: boolean;
  push: (r: Route) => void;
  reset: (r: Route) => void;
  back: () => void;
  cart: CartLine[];
  count: number;
  subtotal: number;
  add: (id: string, qty: number, picks?: string[]) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const [stack, setStack] = useState<Route[]>([{ name: 'home' }]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [catalog, setCatalogState] = useState<CatalogState>(shopifyEnabled() ? 'loading' : 'demo');

  const reloadCatalog = useCallback(() => {
    if (!shopifyEnabled()) return;
    setCatalogState('loading');
    fetchProducts()
      .then((list) => {
        setCatalog(list);
        // Drop cart lines for products no longer published to the app.
        setCart((c) => c.filter((l) => byId(l.id)));
        setCatalogState('live');
      })
      .catch((err) => {
        console.warn('Shopify products failed to load', err);
        setCatalogState('error');
      });
  }, []);

  useEffect(reloadCatalog, [reloadCatalog]);

  const push = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const reset = useCallback((r: Route) => setStack([r]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);

  const add = useCallback((id: string, qty: number, picks?: string[]) => {
    const key = picks?.length ? `${id}|${picks.join(',')}` : id;
    setCart((c) => {
      const found = c.find((l) => l.key === key);
      return found
        ? c.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
        : [...c, { key, id, qty, picks }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setCart((c) => (qty <= 0 ? c.filter((l) => l.key !== key) : c.map((l) => (l.key === key ? { ...l, qty } : l))));
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const value = useMemo<Ctx>(() => {
    const count = cart.reduce((n, l) => n + l.qty, 0);
    const subtotal = cart.reduce((n, l) => n + (byId(l.id)?.price ?? 0) * l.qty, 0);
    return {
      catalog,
      reloadCatalog,
      lang,
      rtl: lang === 'ar',
      t: STRINGS[lang],
      toggleLang: () => setLang((l) => (l === 'en' ? 'ar' : 'en')),
      route: stack[stack.length - 1],
      canGoBack: stack.length > 1,
      push,
      reset,
      back,
      cart,
      count,
      subtotal,
      add,
      setQty,
      clear,
    };
  }, [catalog, reloadCatalog, lang, stack, cart, push, reset, back, add, setQty, clear]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
