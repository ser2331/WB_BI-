import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PageScroll } from '@/components/layout/Layout.styles';
import { LoadingState, Skeleton } from '@/components/dashboard/dashboard.styles';

const CategoriesPage = lazy(() =>
  import('@/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const CategoryDetailPage = lazy(() =>
  import('@/pages/CategoryDetailPage').then((m) => ({ default: m.CategoryDetailPage }))
);
const ImportPage = lazy(() =>
  import('@/pages/ImportPage').then((m) => ({ default: m.ImportPage }))
);

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (!base || base === '/') return undefined;
  return base.replace(/\/$/, '');
}

function PageLoader() {
  return (
    <PageScroll>
      <LoadingState>
        <span>Загрузка…</span>
        <Skeleton $h={80} />
      </LoadingState>
    </PageScroll>
  );
}

export function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageLoader />}>
                <CategoriesPage />
              </Suspense>
            }
          />
          <Route
            path="/category/:subject"
            element={
              <Suspense fallback={<PageLoader />}>
                <CategoryDetailPage />
              </Suspense>
            }
          />
          <Route
            path="/import"
            element={
              <Suspense fallback={<PageLoader />}>
                <ImportPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
