import { Link, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { App } from 'antd';
import { buildQueryString } from '@/types/dashboardApi';
import { useDashboardParams } from '@/hooks/useDashboardParams';
import {
  useGetCategoryBlocksQuery,
  useGetDashboardFiltersQuery,
  useGetDashboardMetaQuery,
} from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { BlockSortControls } from '@/components/dashboard/BlockSortControls';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { GlueBlocksList } from '@/components/dashboard/GlueBlock';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { DashboardPageSkeleton } from '@/components/ui/skeletons/DashboardPageSkeleton';
import { PageOverlay } from '@/components/ui/PageOverlay';
import {
  BLOCK_EXPORT_COLUMNS,
  flattenBlocksForExport,
  formatCountLabel,
  formatExportFilename,
} from '@/constants/exportColumns';
import { fetchAllBlocks } from '@/utils/fetchAllPages';
import { downloadCsv, rowsToCsv } from '@/utils/exportCsv';
import { sortGlueBlocks, type BlockSortField, type SortDirection } from '@/utils/sortGlueBlocks';
import { Button, Card, Empty, Space } from 'antd';

export function CategoryDetailPage() {
  const { message } = App.useApp();
  const { subject: subjectParam } = useParams<{ subject: string }>();
  const subject = useMemo(
    () => (subjectParam ? decodeURIComponent(subjectParam) : ''),
    [subjectParam]
  );
  const { params, apiQuery, setParams } = useDashboardParams(10);
  const [blockSortBy, setBlockSortBy] = useState<BlockSortField>('orders');
  const [blockSortDir, setBlockSortDir] = useState<SortDirection>('desc');
  const [exporting, setExporting] = useState(false);

  const blocksQuery = useMemo(
    () => ({
      subject,
      periodKey: apiQuery.periodKey,
      brand: apiQuery.brand,
      search: apiQuery.search,
      page: apiQuery.page,
      pageSize: apiQuery.pageSize,
    }),
    [subject, apiQuery]
  );

  const { data: meta, isLoading: metaLoading, error: metaError } = useGetDashboardMetaQuery();

  const { data: filterOptions, error: filtersError } = useGetDashboardFiltersQuery(undefined, {
    skip: !subject,
  });

  const {
    data,
    isLoading: blocksLoading,
    isFetching: blocksFetching,
    error: blocksError,
  } = useGetCategoryBlocksQuery(blocksQuery, { skip: !subject });

  const sortedBlocks = useMemo(
    () => sortGlueBlocks(data?.items ?? [], blockSortBy, blockSortDir),
    [data?.items, blockSortBy, blockSortDir]
  );

  const backQuery = buildQueryString({
    periodKey: params.periodKey,
    subject: params.subject,
    brand: params.brand,
    search: params.search,
    pageSize: params.pageSize,
  });

  const loading = metaLoading || (blocksLoading && !data);
  const error = getErrorMessage(metaError ?? filtersError ?? blocksError, '');
  const busy = Boolean(subject) && blocksFetching && !blocksLoading;

  const handleExport = async () => {
    if (!subject) return;
    setExporting(true);
    try {
      const blocks = await fetchAllBlocks({
        subject,
        periodKey: apiQuery.periodKey,
        brand: apiQuery.brand,
        search: apiQuery.search,
      });
      const rows = flattenBlocksForExport(blocks, subject);
      if (!rows.length) {
        message.warning('Нет данных для экспорта');
        return;
      }
      downloadCsv(
        formatExportFilename(`blocks_${subject.replace(/[^\wа-яА-Я-]+/gi, '_')}`),
        rowsToCsv(rows, BLOCK_EXPORT_COLUMNS)
      );
      message.success(`Экспортировано ${formatCountLabel(rows.length)} строк`);
    } catch {
      message.error('Не удалось экспортировать данные');
    } finally {
      setExporting(false);
    }
  };

  if (!subject) {
    return (
      <PageOverlay className={layoutClass.dashboardRoot} error="Категория не указана">
        <Card>
          <Empty description="Выберите категорию из списка" />
        </Card>
      </PageOverlay>
    );
  }

  if (loading) {
    return (
      <div className={layoutClass.dashboardRoot}>
        <DashboardPageSkeleton variant="category-detail" />
      </div>
    );
  }

  return (
    <PageOverlay className={layoutClass.dashboardRoot} busy={busy} error={error || null}>
      <div style={{ marginBottom: 8 }}>
        <Link to={`/${backQuery}`}>
          <Button>← Все категории</Button>
        </Link>
      </div>

      <section className={layoutClass.dashboardSection} id="overview">
        <HeroSection meta={meta ?? null} kpis={data?.kpis ?? null} />
      </section>

      <section className={layoutClass.dashboardSection} id="filters">
        <DashboardFilters
          title={subject}
          options={filterOptions ?? null}
          showSubject={false}
          filters={{
            periodKey: params.periodKey,
            subject: '',
            brand: params.brand,
            search: params.search,
          }}
          onChange={(f) =>
            setParams(
              {
                periodKey: f.periodKey,
                brand: f.brand,
                search: f.search,
              },
              true
            )
          }
          paging={
            data
              ? {
                  page: data.page,
                  from: data.from_index,
                  to: data.to_index,
                  total: data.total,
                  pageSize: params.pageSize,
                  pageSizeOptions: [5, 10, 15, 25],
                  onPageChange: (page) => setParams({ page }),
                  onPageSizeChange: (pageSize) => setParams({ pageSize }, true),
                }
              : null
          }
        />
      </section>

      <section className={layoutClass.dashboardSection} id="blocks">
        <Card
          className={layoutClass.blocksCard}
          title={`Склейки (${data?.total ?? 0})`}
          extra={
            <div className={layoutClass.cardToolbar}>
              <BlockSortControls
                className="card-toolbar__sort"
                sortBy={blockSortBy}
                sortDir={blockSortDir}
                onSortByChange={setBlockSortBy}
                onSortDirToggle={() => setBlockSortDir((dir) => (dir === 'desc' ? 'asc' : 'desc'))}
              />
              <Button
                className="card-toolbar__export"
                size="small"
                icon={<DownloadOutlined />}
                loading={exporting}
                onClick={() => void handleExport()}
              >
                Экспорт CSV
              </Button>
            </div>
          }
        >
          {!data?.items.length ? (
            <Empty description="По фильтрам склеек не найдено" />
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <GlueBlocksList blocks={sortedBlocks} />
            </Space>
          )}
        </Card>
      </section>
    </PageOverlay>
  );
}
