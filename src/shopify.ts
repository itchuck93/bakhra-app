// ============================================================================
//  SHOPIFY SETTINGS — this is the only place you need to edit.
// ============================================================================
//
//  1. SHOPIFY_STORE_DOMAIN: your store's Shopify address, e.g. 'bakhra.myshopify.com'
//     (Shopify admin → Settings → Domains, the one ending in .myshopify.com)
//
//  2. SHOPIFY_PUBLIC_TOKEN: the *Public* access token from
//     Shopify admin → Sales channels → Headless → your storefront → Storefront API.
//     Never put the Private access token or an Admin API token here.
//
//  3. APP_DISCOUNT_CODE (optional): a Shopify discount code the app adds to
//     every checkout automatically, for app-only offers. Leave '' for none.
//
//  While the domain or token is empty, the app keeps running in demo mode
//  with the built-in product list and the demo checkout form.
// ============================================================================

export const SHOPIFY_STORE_DOMAIN = '';
export const SHOPIFY_PUBLIC_TOKEN = '';
export const APP_DISCOUNT_CODE = '';

// ----------------------------------------------------------------------------
//  Nothing below needs changing.
// ----------------------------------------------------------------------------

import { Category, DEMO_PRODUCTS, Product } from './data';

const API_VERSION = '2026-10';

export const shopifyEnabled = () => SHOPIFY_STORE_DOMAIN.trim() !== '' && SHOPIFY_PUBLIC_TOKEN.trim() !== '';

async function storefront<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const domain = SHOPIFY_STORE_DOMAIN.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
  const res = await fetch(`https://${domain}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_PUBLIC_TOKEN.trim(),
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify returned ${res.status}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e: { message: string }) => e.message).join('; '));
  return json.data as T;
}

// ---------- Products ----------

type ShopifyProduct = {
  handle: string;
  title: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  featuredImage: { url: string } | null;
  variants: {
    nodes: {
      id: string;
      title: string;
      availableForSale: boolean;
      price: { amount: string };
      compareAtPrice: { amount: string } | null;
    }[];
  };
};

const PRODUCTS_QUERY = `
  query Products($cursor: String) {
    products(first: 100, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      nodes {
        handle title productType tags availableForSale
        featuredImage { url }
        variants(first: 1) {
          nodes { id title availableForSale price { amount } compareAtPrice { amount } }
        }
      }
    }
  }`;

function guessCategory(p: ShopifyProduct): Category {
  const text = `${p.productType} ${p.tags.join(' ')} ${p.title} ${p.handle}`.toLowerCase();
  if (text.includes('bundle') || text.includes('set') || text.includes('trio')) return 'bundle';
  if (text.includes('roll')) return 'roll';
  if (text.includes('all over') || text.includes('all-over') || text.includes('spray')) return 'spray';
  return 'perfume';
}

function toProduct(p: ShopifyProduct): Product | null {
  const v = p.variants.nodes[0];
  if (!v) return null;
  const demo = DEMO_PRODUCTS.find((d) => d.id === p.handle);
  const price = Number(v.price.amount);
  const compareAt = v.compareAtPrice ? Number(v.compareAtPrice.amount) : undefined;
  return {
    id: p.handle,
    name: demo?.name ?? p.title.toUpperCase(),
    category: demo?.category ?? guessCategory(p),
    size: v.title !== 'Default Title' ? v.title : demo?.size,
    price,
    compareAt: compareAt && compareAt > price ? compareAt : undefined,
    soldOut: !p.availableForSale || !v.availableForSale,
    image: p.featuredImage?.url ?? demo?.image ?? '',
    // Bundle scent slots aren't stored in Shopify; they come from the app's list.
    slots: demo?.slots,
    variantId: v.id,
  };
}

/** Loads every product published to the Headless channel. */
export async function fetchProducts(): Promise<Product[]> {
  const all: Product[] = [];
  let cursor: string | null = null;
  do {
    type Page = { products: { pageInfo: { hasNextPage: boolean; endCursor: string }; nodes: ShopifyProduct[] } };
    const data: Page = await storefront<Page>(PRODUCTS_QUERY, { cursor });
    for (const node of data.products.nodes) {
      const prod = toProduct(node);
      if (prod) all.push(prod);
    }
    cursor = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
  } while (cursor);
  return all;
}

// ---------- Cart and checkout ----------

export type CheckoutLine = {
  variantId: string;
  quantity: number;
  /** Shown on the order in Shopify admin, e.g. the scents picked for a bundle. */
  note?: string;
};

const CART_CREATE = `
  mutation CartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { checkoutUrl }
      userErrors { message }
    }
  }`;

/** Creates a Shopify cart and returns the link to Shopify's own checkout. */
export async function createCheckout(lines: CheckoutLine[]): Promise<string> {
  type Res = { cartCreate: { cart: { checkoutUrl: string } | null; userErrors: { message: string }[] } };
  const data = await storefront<Res>(CART_CREATE, {
    input: {
      lines: lines.map((l) => ({
        merchandiseId: l.variantId,
        quantity: l.quantity,
        attributes: l.note ? [{ key: 'Scents', value: l.note }] : [],
      })),
      discountCodes: APP_DISCOUNT_CODE.trim() ? [APP_DISCOUNT_CODE.trim()] : [],
      attributes: [{ key: 'Source', value: 'BAKHRA mobile app' }],
    },
  });
  const { cart, userErrors } = data.cartCreate;
  if (!cart) throw new Error(userErrors.map((e) => e.message).join('; ') || 'Could not create cart');
  return cart.checkoutUrl;
}
