import { useCallback, useState } from 'react';
import { App } from 'antd';
import { downloadCsv, rowsToCsv, type CsvColumn } from '@/utils/exportCsv';
import { formatExportFilename } from '@/constants/exportColumns';
import { fmtNum } from '@/utils/format';

interface ExportParams<T> {
  fetchRows: () => Promise<T[]>;
  columns: CsvColumn<T>[];
  filenamePrefix: string;
  itemLabel: string;
}

export function useCsvExport() {
  const { message } = App.useApp();
  const [exporting, setExporting] = useState(false);

  const exportCsv = useCallback(
    async <T>({ fetchRows, columns, filenamePrefix, itemLabel }: ExportParams<T>) => {
      setExporting(true);
      try {
        const rows = await fetchRows();
        if (!rows.length) {
          message.warning('Нет данных для экспорта');
          return;
        }
        downloadCsv(formatExportFilename(filenamePrefix), rowsToCsv(rows, columns));
        message.success(`Экспортировано ${fmtNum(rows.length)} ${itemLabel}`);
      } catch {
        message.error('Не удалось экспортировать данные');
      } finally {
        setExporting(false);
      }
    },
    [message]
  );

  return { exporting, exportCsv };
}
