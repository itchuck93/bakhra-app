// Catalogue taken from bakhra.com (Nov 2026). Prices are in KWD.
// Used as a fallback and for bundle scent slots; live products come from src/shopify.ts.

export type Category = 'perfume' | 'spray' | 'roll' | 'bundle';
export type ScentGroup = 'spray' | 'roll';

export type Product = {
  id: string;
  name: string;
  category: Category;
  size?: string;
  price: number;
  compareAt?: number;
  soldOut?: boolean;
  image: string;
  /** Bundles: one entry per bottle the customer picks a scent for. */
  slots?: ScentGroup[];
  /** Shopify variant ID, filled in when products load from Shopify. */
  variantId?: string;
};

const cdn = (file: string, w = 1000) => `https://bakhra.com/cdn/shop/files/${file}&width=${w}`;

export const LOGO = cdn('bakhra-official-en-logo.png?v=1791835728', 800);

export const SLIDES: string[] = [
  cdn('bakhra-campaign-slide-1.png?v=1791835729', 1600),
  cdn('bakhra-campaign-slide-2.png?v=1791835729', 1600),
  cdn('bakhra-campaign-slide-3.png?v=1791835730', 1600),
  cdn('bakhra-campaign-slide-4.jpg?v=1791835729', 1600),
  cdn('bakhra-campaign-slide-5.png?v=1791835728', 1600),
  cdn('bakhra-campaign-slide-6.png?v=1791835730', 1600),
];

export const DEMO_PRODUCTS: Product[] = [
  { id: 'akash-100-ml', name: 'AKASH', category: 'perfume', size: '100 ml', price: 22, image: cdn('bakhra-akash-eau-de-parfum.jpg?v=1791823718') },
  { id: 'musk-roll-on-5-ml', name: 'MUSK', category: 'roll', size: '5 ml', price: 5, image: cdn('bakhra-musk-roll-on-5ml.png?v=1791823729') },
  { id: 'pom-all-over-spray-100-ml', name: 'POM', category: 'spray', size: '100 ml', price: 12, image: cdn('bakhra-pom-all-over-spray-100ml.jpg?v=1791823735') },
  { id: '920-all-over-spray-100-ml', name: '920', category: 'spray', size: '100 ml', price: 12, image: cdn('bakhra-920-all-over-spray-100ml.jpg?v=1791823672') },
  { id: 'musk-all-over-spray-100-ml', name: 'MUSK', category: 'spray', size: '100 ml', price: 12, image: cdn('bakhra-musk-all-over-spray-100ml.jpg?v=1791823724') },
  { id: 'pach-all-over-spray-100-ml', name: 'PACH', category: 'spray', size: '100 ml', price: 12, image: cdn('bakhra-pach-all-over-spray-100ml.jpg?v=1791823732') },
  { id: 'van-all-over-spray-100-ml', name: 'VAN', category: 'spray', size: '100 ml', price: 12, image: cdn('bakhra-van-all-over-spray-100ml.jpg?v=1791823738') },
  { id: 'creme-all-over-spray-100-ml', name: 'CRÈME', category: 'spray', size: '100 ml', price: 12, soldOut: true, image: cdn('bakhra-creme-all-over-spray-100ml.jpg?v=1792004979') },
  { id: 'creme-roll-on-5-ml', name: 'CRÈME', category: 'roll', size: '5 ml', price: 5, soldOut: true, image: cdn('bakhra-creme-roll-on-5ml.png?v=1791823721') },

  // Bundles. The Trio's "pick each scent" options match the site; the slot
  // layout of the other three is assumed from their names — confirm with the brand.
  { id: 'akash-all-over-bundle', name: 'Perfume + All Over Bundle', category: 'bundle', price: 29, compareAt: 34, image: cdn('akash-all-over-bundle.jpg?v=1792612740'), slots: ['spray'] },
  { id: 'all-over-trio-bundle', name: 'All Over Trio', category: 'bundle', price: 29, compareAt: 36, image: cdn('all-over-trio-bundle.jpg?v=1792612747'), slots: ['spray', 'spray', 'spray'] },
  { id: 'roll-on-set-of-5', name: 'Roll-On Set', category: 'bundle', price: 20, compareAt: 25, image: cdn('roll-on-set-of-5.jpg?v=1792612755'), slots: ['roll', 'roll', 'roll', 'roll', 'roll'] },
  { id: 'all-over-roll-on-bundle', name: 'All Over + Roll-On Bundle', category: 'bundle', price: 15, compareAt: 17, image: cdn('all-over-roll-on-bundle.jpg?v=1792612762'), slots: ['spray', 'roll'] },
];

/** The catalogue the screens show: the demo list until Shopify products load. */
export const PRODUCTS: Product[] = [...DEMO_PRODUCTS];

/** Swaps in the live catalogue from Shopify. */
export function setCatalog(list: Product[]) {
  PRODUCTS.splice(0, PRODUCTS.length, ...list);
}

export const FREE_DELIVERY_FROM = 30;
export const WHATSAPP = '96596084901';
export const EMAIL = 'bakhra.kw@gmail.com';
export const INSTAGRAM = 'bakhra.co';

export const byId = (id: string) => PRODUCTS.find((p) => p.id === id);
export const scentsFor = (group: ScentGroup) => PRODUCTS.filter((p) => p.category === group);
