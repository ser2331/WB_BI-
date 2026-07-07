import { ConfigProvider, App as AntApp } from 'antd';
import ruRU from 'antd/locale/ru_RU';
import type { ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';
import { buildAntdTheme } from '@/theme/antdTheme';

interface Props {
  children: ReactNode;
}

export function AppProviders({ children }: Props) {
  const mode = useAppSelector((state) => state.theme.mode);

  return (
    <ConfigProvider locale={ruRU} theme={buildAntdTheme(mode)}>
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}
