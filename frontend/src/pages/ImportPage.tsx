import { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { App, Modal } from 'antd';
import { useClearImportMutation, useImportFileMutation } from '@/api/wbApi';
import { getErrorMessage } from '@/api/error';
import { layoutClass } from '@/components/dashboard/dashboard.layout';
import { PageOverlay } from '@/components/ui/PageOverlay';
import { Button, Card, Space, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd';

export function ImportPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [error, setError] = useState<string | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [importFile, { isLoading: importing }] = useImportFileMutation();
  const [clearImport, { isLoading: clearing }] = useClearImportMutation();
  const uploading = importing || clearing;

  const selectedFile = fileList[0]?.originFileObj ?? null;

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Выберите файл');
      return;
    }
    setError(null);
    try {
      const result = await importFile(selectedFile).unwrap();
      message.success(
        `${result.message}: ${result.blocks_count} склеек, ${result.products_count} товаров`
      );
      setTimeout(() => {
        void navigate('/');
      }, 800);
    } catch (e) {
      setError(getErrorMessage(e, 'Ошибка загрузки'));
    }
  };

  const handleClear = () => {
    Modal.confirm({
      title: 'Удалить все загруженные данные?',
      content: 'Это действие нельзя отменить. Дашборд станет пустым до следующего импорта.',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        setError(null);
        try {
          await clearImport().unwrap();
          setFileList([]);
          message.success('Загруженные данные удалены');
        } catch (e) {
          setError(getErrorMessage(e, 'Ошибка удаления'));
        }
      },
    });
  };

  return (
    <PageOverlay
      className={layoutClass.dashboardRoot}
      busy={uploading}
      busyText={importing ? 'Загрузка и обработка файла…' : 'Удаление данных…'}
      error={error}
    >
      <Card title="Импорт данных">
        <Typography.Paragraph type="secondary">
          Загрузите CSV или JSON. JSON в формате dash_2 (с полем blocks) загружается напрямую. CSV —
          плоский список товаров с колонками nm, subject, brand, orders, sales, stock и др.
        </Typography.Paragraph>

        <Upload.Dragger
          accept=".csv,.json,text/csv,application/json"
          maxCount={1}
          fileList={fileList}
          beforeUpload={(file) => {
            const lower = file.name.toLowerCase();
            if (!lower.endsWith('.csv') && !lower.endsWith('.json')) {
              setError('Поддерживаются только файлы .csv и .json');
              return Upload.LIST_IGNORE;
            }
            setError(null);
            setFileList([
              {
                uid: file.uid,
                name: file.name,
                status: 'done',
                originFileObj: file,
              },
            ]);
            return false;
          }}
          onRemove={() => {
            setFileList([]);
            return true;
          }}
          disabled={uploading}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Перетащите файл сюда или нажмите для выбора</p>
          <p className="ant-upload-hint">CSV, JSON · до нескольких мегабайт</p>
        </Upload.Dragger>

        <Space wrap style={{ marginTop: 16 }}>
          <Button
            type="primary"
            onClick={() => void handleUpload()}
            loading={importing}
            disabled={!selectedFile}
          >
            Загрузить и обработать
          </Button>
          <Button danger onClick={handleClear} loading={clearing}>
            Очистить данные
          </Button>
        </Space>
      </Card>

      <Card title="Формат CSV">
        <Typography.Paragraph type="secondary">
          Минимум: колонка <Typography.Text code>nm</Typography.Text> (артикул WB). Рекомендуемые:
          subject, brand, vendorCode, orders, sales, stock, spp, kvv, ad_ctr, title, groupKey,
          periodKey, periodLabel, photo, wbUrl.
        </Typography.Paragraph>
      </Card>
    </PageOverlay>
  );
}
