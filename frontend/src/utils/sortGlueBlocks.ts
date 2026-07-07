import type { GlueBlock } from '@/types/dashboard';

export type BlockSortField =
  | 'orders'
  | 'sales'
  | 'stock'
  | 'ad_ctr'
  | 'spp'
  | 'kvv'
  | 'title'
  | 'skuCount';

export type SortDirection = 'asc' | 'desc';

export function sortGlueBlocks(
  blocks: GlueBlock[],
  field: BlockSortField,
  direction: SortDirection
): GlueBlock[] {
  const reverse = direction === 'desc';

  const sorted = [...blocks].sort((a, b) => {
    if (field === 'title') {
      const cmp = a.title.localeCompare(b.title, 'ru');
      return reverse ? -cmp : cmp;
    }

    const av = a[field] ?? (field === 'stock' ? null : 0);
    const bv = b[field] ?? (field === 'stock' ? null : 0);

    if (av === null && bv === null) return 0;
    if (av === null) return 1;
    if (bv === null) return -1;

    const cmp = Number(av) - Number(bv);
    return reverse ? -cmp : cmp;
  });

  return sorted;
}

export function sortProductsByOrders<T extends { orders?: number | null }>(products: T[]): T[] {
  return [...products].sort((a, b) => (b.orders ?? 0) - (a.orders ?? 0));
}
