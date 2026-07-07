export interface Period {
  key: string;
  start?: string | null;
  end?: string | null;
  label: string;
  capturedAt?: string | null;
  runId?: string | null;
}

export interface ProductCard {
  nm: string;
  vendorCode?: string | null;
  brand?: string | null;
  subject?: string | null;
  orders?: number | null;
  sales?: number | null;
  stock?: number | null;
  spp?: number | null;
  kvv?: number | null;
  ad_ctr?: number | null;
  photo?: string | null;
  wbUrl?: string | null;
  imt?: string | null;
}

export interface GlueBlock {
  periodKey: string;
  periodLabel?: string | null;
  subject: string;
  groupKey?: string | null;
  blockId?: string | null;
  title: string;
  brands: string[];
  skuCount: number;
  orders: number;
  sales: number;
  stock?: number | null;
  kvv?: number | null;
  spp?: number | null;
  ad_ctr?: number | null;
  products: ProductCard[];
}

export interface ImportResponse {
  success: boolean;
  message: string;
  file_name: string;
  format: string;
  blocks_count: number;
  products_count: number;
}
