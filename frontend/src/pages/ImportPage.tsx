import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClearImportMutation, useImportFileMutation } from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import {
  Card,
  DropZone,
  ErrorMsg,
  ImportActions,
  SectionHeader,
  SuccessMsg,
} from '@/components/dashboard/dashboard.styles';
import { Button, PageScroll } from '@/components/layout/Layout.styles';

export function ImportPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [importFile, { isLoading: importing }] = useImportFileMutation();
  const [clearImport, { isLoading: clearing }] = useClearImportMutation();
  const uploading = importing || clearing;

  const acceptFile = (file: File | null) => {
    if (!file) return;
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.csv') && !lower.endsWith('.json')) {
      setError('Поддерживаются только файлы .csv и .json');
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSuccess(null);
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Выберите файл');
      return;
    }
    setError(null);
    setSuccess(null);
    try {
      const result = await importFile(selectedFile).unwrap();
      setSuccess(
        `${result.message}: ${result.blocks_count} склеек, ${result.products_count} товаров`
      );
      setTimeout(() => {
        void navigate('/');
      }, 800);
    } catch (e) {
      setError(getErrorMessage(e, 'Ошибка загрузки'));
    }
  };

  const handleClear = async () => {
    setError(null);
    setSuccess(null);
    try {
      await clearImport().unwrap();
      setSelectedFile(null);
      setSuccess('Загруженные данные удалены');
    } catch (e) {
      setError(getErrorMessage(e, 'Ошибка удаления'));
    }
  };

  return (
    <PageScroll>
      <Card>
        <SectionHeader>
          <h1 style={{ fontSize: 24 }}>Импорт данных</h1>
        </SectionHeader>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
          Загрузите CSV или JSON. JSON в формате dash_2 (с полем blocks) загружается напрямую. CSV —
          плоский список товаров с колонками nm, subject, brand, orders, sales, stock и др.
        </p>

        {error && <ErrorMsg>{error}</ErrorMsg>}
        {success && <SuccessMsg>{success}</SuccessMsg>}

        <DropZone
          $active={dragging}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            acceptFile(e.dataTransfer.files[0] ?? null);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            onChange={(e) => acceptFile(e.target.files?.[0] ?? null)}
          />
          <strong>{selectedFile ? selectedFile.name : 'Перетащите файл сюда'}</strong>
          <span>или нажмите для выбора · CSV, JSON · до нескольких мегабайт</span>
        </DropZone>

        <ImportActions>
          <Button $variant="primary" onClick={handleUpload} disabled={uploading || !selectedFile}>
            {importing ? 'Загрузка…' : 'Загрузить и обработать'}
          </Button>
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            Выбрать файл
          </Button>
          <Button onClick={handleClear} disabled={uploading}>
            {clearing ? 'Удаление…' : 'Очистить данные'}
          </Button>
        </ImportActions>
      </Card>

      <Card>
        <h2 style={{ fontSize: 18, marginBottom: 12 }}>Формат CSV</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6 }}>
          Минимум: колонка <code>nm</code> (артикул WB). Рекомендуемые: subject, brand, vendorCode,
          orders, sales, stock, spp, kvv, ad_ctr, title, groupKey, periodKey, periodLabel, photo,
          wbUrl.
        </p>
      </Card>
    </PageScroll>
  );
}
