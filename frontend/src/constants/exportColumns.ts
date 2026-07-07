import type { CsvColumn } from '@/utils/exportCsv';
import type { CategorySummary, ProductTableRow } from '@/types/dashboardApi';
import type { GlueBlock } from '@/types/dashboard';
import { fmtNum, fmtPct } from '@/utils/format';

export const PRODUCT_EXPORT_COLUMNS: CsvColumn<ProductTableRow>[] = [
  { header: 'SKU', value: (r) => r.nm },
  { header: 'Артикул', value: (r) => r.vendor_code },
  { header: 'Предмет', value: (r) => r.subject },
  { header: 'Бренд', value: (r) => r.brand },
  { header: 'Период', value: (r) => r.period_label },
  { header: 'Склейка', value: (r) => r.glue_title },
  { header: 'Заказы', value: (r) => r.orders },
  { header: 'Продажи', value: (r) => r.sales },
  { header: 'Остаток', value: (r) => r.stock },
  { header: 'СПП', value: (r) => r.spp != null ? fmtPct(r.spp) : '' },
  { header: 'CTR', value: (r) => r.ad_ctr != null ? fmtPct(r.ad_ctr) : '' },
];

export const CATEGORY_EXPORT_COLUMNS: CsvColumn<CategorySummary>[] = [
  { header: 'Предмет', value: (r) => r.subject },
  { header: 'Склеек', value: (r) => r.glues },
  { header: 'SKU', value: (r) => r.sku },
  { header: 'Заказы', value: (r) => r.orders },
  { header: 'Продажи', value: (r) => r.sales },
  { header: 'Остаток', value: (r) => r.stock },
];

export interface BlockExportRow {
  subject: string;
  glue_title: string;
  period_label: string | null | undefined;
  brands: string;
  sku_count: number;
  orders: number;
  sales: number;
  stock: number | null | undefined;
  spp: number | null | undefined;
  kvv: number | null | undefined;
  ad_ctr: number | null | undefined;
  nm: string;
  vendor_code: string | null | undefined;
  product_brand: string | null | undefined;
  product_orders: number | null | undefined;
  product_sales: number | null | undefined;
  product_stock: number | null | undefined;
  product_spp: number | null | undefined;
  product_kvv: number | null | undefined;
  product_ad_ctr: number | null | undefined;
}

export function flattenBlocksForExport(blocks: GlueBlock[], subject: string): BlockExportRow[] {
  const rows: BlockExportRow[] = [];

  for (const block of blocks) {
    for (const product of block.products) {
      rows.push({
        subject,
        glue_title: block.title,
        period_label: block.periodLabel,
        brands: block.brands.join('; '),
        sku_count: block.skuCount,
        orders: block.orders,
        sales: block.sales,
        stock: block.stock,
        spp: block.spp,
        kvv: block.kvv,
        ad_ctr: block.ad_ctr,
        nm: product.nm,
        vendor_code: product.vendorCode,
        product_brand: product.brand,
        product_orders: product.orders,
        product_sales: product.sales,
        product_stock: product.stock,
        product_spp: product.spp,
        product_kvv: product.kvv,
        product_ad_ctr: product.ad_ctr,
      });
    }
  }

  return rows;
}

export const BLOCK_EXPORT_COLUMNS: CsvColumn<BlockExportRow>[] = [
  { header: 'Предмет', value: (r) => r.subject },
  { header: 'Склейка', value: (r) => r.glue_title },
  { header: 'Период', value: (r) => r.period_label },
  { header: 'Бренды', value: (r) => r.brands },
  { header: 'SKU в склейке', value: (r) => r.sku_count },
  { header: 'Заказы склейки', value: (r) => r.orders },
  { header: 'Продажи склейки', value: (r) => r.sales },
  { header: 'Остаток склейки', value: (r) => r.stock },
  { header: 'СПП склейки', value: (r) => r.spp != null ? fmtPct(r.spp) : '' },
  { header: 'КВВ склейки', value: (r) => r.kvv != null ? fmtPct(r.kvv) : '' },
  { header: 'CTR склейки', value: (r) => r.ad_ctr != null ? fmtPct(r.ad_ctr) : '' },
  { header: 'SKU', value: (r) => r.nm },
  { header: 'Артикул', value: (r) => r.vendor_code },
  { header: 'Бренд SKU', value: (r) => r.product_brand },
  { header: 'Заказы SKU', value: (r) => r.product_orders },
  { header: 'Продажи SKU', value: (r) => r.product_sales },
  { header: 'Остаток SKU', value: (r) => r.product_stock },
  { header: 'СПП SKU', value: (r) => r.product_spp != null ? fmtPct(r.product_spp) : '' },
  { header: 'КВВ SKU', value: (r) => r.product_kvv != null ? fmtPct(r.product_kvv) : '' },
  { header: 'CTR SKU', value: (r) => r.product_ad_ctr != null ? fmtPct(r.product_ad_ctr) : '' },
];

export function formatExportFilename(prefix: string): string {
  const stamp = new Date().toISOString().slice(0, 10);
  return `${prefix}_${stamp}.csv`;
}

export function formatCountLabel(count: number): string {
  return fmtNum(count);
}
