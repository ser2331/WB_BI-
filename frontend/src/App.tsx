import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RequireAdmin, RequireAuth } from '@/components/auth/RequireAuth';
import { Layout } from '@/components/layout/Layout';
import { RouteFallback } from '@/components/ui/skeletons/PageSkeleton';

const CategoriesPage = lazy(() =>
  import('@/pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage }))
);
const CategoryDetailPage = lazy(() =>
  import('@/pages/CategoryDetailPage').then((m) => ({ default: m.CategoryDetailPage }))
);
const ImportPage = lazy(() =>
  import('@/pages/ImportPage').then((m) => ({ default: m.ImportPage }))
);
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const DataTablePage = lazy(() =>
  import('@/pages/DataTablePage').then((m) => ({ default: m.DataTablePage }))
);
const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (!base || base === '/') return undefined;
  return base.replace(/\/$/, '');
}

export function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<RouteFallback />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route
              path="/"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <CategoriesPage />
                </Suspense>
              }
            />
            <Route
              path="/analytics"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <AnalyticsPage />
                </Suspense>
              }
            />
            <Route
              path="/data"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <DataTablePage />
                </Suspense>
              }
            />
            <Route
              path="/category/:subject"
              element={
                <Suspense fallback={<RouteFallback />}>
                  <CategoryDetailPage />
                </Suspense>
              }
            />
            <Route element={<RequireAdmin />}>
              <Route
                path="/import"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <ImportPage />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
