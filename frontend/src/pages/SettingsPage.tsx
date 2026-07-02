import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { media } from '@/styles/breakpoints';
import { api } from '@/api/client';
import type { DataSourceConfig, SyncResult, WBConnectionStatus } from '@/types/api';
import { Button, Card, CardTitle } from '@/components/layout/Layout.styles';

const Section = styled.section`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;

  ${media.mobile} {
    font-size: 16px;
    margin-bottom: 12px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
`;

const Input = styled.input`
  padding: 10px 14px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const SourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SourceItem = styled(Card)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 14px 16px;
  }
`;

const SourceInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const SourceDesc = styled.div`
  font-size: 13px;
  color: var(--color-text-muted);
`;

const SourceMeta = styled.div`
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
`;

const SourceControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;

  ${media.mobile} {
    justify-content: space-between;
    width: 100%;
  }
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: pointer;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    inset: 0;
    background: var(--color-border);
    border-radius: 24px;
    transition: 0.2s;

    &::before {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.2s;
    }
  }

  input:checked + span {
    background: var(--color-primary);

    &::before {
      transform: translateX(20px);
    }
  }
`;

const IntervalSelect = styled.select`
  padding: 6px 10px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  color: var(--color-text);
  font-size: 13px;
`;

const CategoryBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(124, 92, 252, 0.15);
  color: var(--color-primary);
  margin-left: 8px;

  ${media.mobile} {
    margin-left: 0;
    margin-top: 4px;
  }
`;

const SourceName = styled.div`
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;

  ${media.mobile} {
    font-size: 14px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Message = styled.div<{ $type?: 'success' | 'error' }>`
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 16px;
  background: ${({ $type }) =>
    $type === 'error'
      ? 'rgba(248, 113, 113, 0.1)'
      : 'rgba(52, 211, 153, 0.1)'};
  color: ${({ $type }) =>
    $type === 'error' ? 'var(--color-danger)' : 'var(--color-success)'};
  border: 1px solid
    ${({ $type }) =>
      $type === 'error' ? 'var(--color-danger)' : 'var(--color-success)'};
`;

const Hint = styled.p`
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.6;
`;

export function SettingsPage() {
  const [wbStatus, setWbStatus] = useState<WBConnectionStatus | null>(null);
  const [token, setToken] = useState('');
  const [sources, setSources] = useState<DataSourceConfig[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const load = useCallback(async () => {
    const [status, dataSources] = await Promise.all([
      api.getWBStatus(),
      api.getDataSources(),
    ]);
    setWbStatus(status);
    setSources(dataSources);
  }, []);

  useEffect(() => {
    load().catch(() => null);
  }, [load]);

  const handleConnectMock = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const status = await api.connectMock();
      setWbStatus(status);
      setMessage({
        text: `Демо подключено: ${status.seller_name}. Данные загружены.`,
        type: 'success',
      });
      await load();
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : 'Ошибка демо-режима',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!token.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const status = await api.connectWB(token.trim());
      setWbStatus(status);
      setToken('');
      setMessage({ text: `Подключено: ${status.seller_name}`, type: 'success' });
      await load();
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : 'Ошибка подключения',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await api.disconnectWB();
    setWbStatus({ connected: false, message: 'Отключено' });
    setMessage({ text: 'Аккаунт отключён', type: 'success' });
  };

  const handleToggle = async (source: DataSourceConfig) => {
    try {
      const updated = await api.updateDataSource(source.source_key, {
        enabled: !source.enabled,
        sync_interval_minutes: source.sync_interval_minutes,
      });
      setSources((prev) =>
        prev.map((s) => (s.source_key === updated.source_key ? updated : s))
      );
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : 'Ошибка обновления',
        type: 'error',
      });
    }
  };

  const handleIntervalChange = async (
    source: DataSourceConfig,
    interval: number
  ) => {
    try {
      const updated = await api.updateDataSource(source.source_key, {
        enabled: source.enabled,
        sync_interval_minutes: interval,
      });
      setSources((prev) =>
        prev.map((s) => (s.source_key === updated.source_key ? updated : s))
      );
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : 'Ошибка обновления',
        type: 'error',
      });
    }
  };

  const handleSyncAll = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const results: SyncResult[] = await api.syncData();
      const ok = results.filter((r) => r.success);
      const fail = results.filter((r) => !r.success);
      if (fail.length > 0) {
        setMessage({
          text: `Синхронизировано: ${ok.length}, ошибок: ${fail.length}. ${fail.map((f) => f.message).join('; ')}`,
          type: 'error',
        });
      } else {
        setMessage({
          text: `Синхронизировано источников: ${ok.length}`,
          type: 'success',
        });
      }
      await load();
    } catch (e) {
      setMessage({
        text: e instanceof Error ? e.message : 'Ошибка синхронизации',
        type: 'error',
      });
    } finally {
      setSyncing(false);
    }
  };

  const categoryLabel = (cat: string) =>
    cat === 'analytics' ? 'Аналитика' : 'Статистика';

  return (
    <div>
      {message && <Message $type={message.type}>{message.text}</Message>}

      <Section>
        <SectionTitle>Подключение Wildberries</SectionTitle>
        <Card>
          {wbStatus?.connected ? (
            <div>
              <CardTitle style={{ textTransform: 'none', fontSize: 16, color: 'var(--color-text)' }}>
                {wbStatus.is_mock && '🧪 '}
                {wbStatus.seller_name || 'Аккаунт подключён'}
                {wbStatus.is_mock && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                    (демо-данные)
                  </span>
                )}
              </CardTitle>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <Button $variant="danger" onClick={handleDisconnect}>
                  Отключить
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Hint style={{ marginBottom: 16 }}>
                Получите API-токен в личном кабинете WB: Настройки → Доступ к API.
                Для полной аналитики нужны категории «Статистика» и «Аналитика».
                Или используйте демо-режим без регистрации на WB.
              </Hint>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                <Button
                  $variant="primary"
                  onClick={handleConnectMock}
                  disabled={loading}
                >
                  {loading ? 'Загрузка…' : '🧪 Демо без WB'}
                </Button>
              </div>
              <FormGroup>
                <Label>API-токен</Label>
                <Input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Вставьте токен WB API"
                />
              </FormGroup>
              <Button
                $variant="primary"
                onClick={handleConnect}
                disabled={loading || !token.trim()}
              >
                {loading ? 'Подключение…' : 'Подключить'}
              </Button>
            </div>
          )}
        </Card>
      </Section>

      <Section>
        <SectionHeader>
          <SectionTitle style={{ marginBottom: 0 }}>Источники данных</SectionTitle>
          <Button onClick={handleSyncAll} disabled={syncing || !wbStatus?.connected}>
            {syncing ? 'Синхронизация…' : 'Синхронизировать включённые'}
          </Button>
        </SectionHeader>
        <Hint style={{ marginBottom: 16 }}>
          Выберите, какие данные загружать из WB. Запросы выполняются с учётом rate limits API.
          На первом этапе виджеты дашборда захардкожены — в будущем их можно будет настраивать через AI-ассистента.
        </Hint>
        <SourceList>
          {sources.map((source) => (
            <SourceItem key={source.source_key}>
              <SourceInfo>
                <SourceName>
                  {source.title}
                  <CategoryBadge>{categoryLabel(source.category)}</CategoryBadge>
                </SourceName>
                <SourceDesc>{source.description}</SourceDesc>
                <SourceMeta>
                  {source.last_synced_at
                    ? `Последняя синхронизация: ${new Date(source.last_synced_at).toLocaleString('ru-RU')}`
                    : 'Ещё не синхронизировался'}
                </SourceMeta>
              </SourceInfo>
              <SourceControls>
                <IntervalSelect
                  value={source.sync_interval_minutes}
                  onChange={(e) =>
                    handleIntervalChange(source, Number(e.target.value))
                  }
                  disabled={!wbStatus?.connected}
                >
                  <option value={15}>каждые 15 мин</option>
                  <option value={30}>каждые 30 мин</option>
                  <option value={60}>каждый час</option>
                  <option value={120}>каждые 2 часа</option>
                  <option value={360}>каждые 6 часов</option>
                </IntervalSelect>
                <Toggle>
                  <input
                    type="checkbox"
                    checked={source.enabled}
                    onChange={() => handleToggle(source)}
                    disabled={!wbStatus?.connected}
                  />
                  <span />
                </Toggle>
              </SourceControls>
            </SourceItem>
          ))}
        </SourceList>
      </Section>
    </div>
  );
}
