import styled from 'styled-components';
import { CardTitle } from '@/components/layout/Layout.styles';
import { media } from '@/styles/breakpoints';

const TableWrap = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 0 -4px;
  padding: 0 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 280px;

  th {
    text-align: left;
    padding: 8px 12px;
    color: var(--color-text-muted);
    font-weight: 500;
    border-bottom: 1px solid var(--color-border);
    white-space: nowrap;
  }

  td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--color-border);
  }

  tr:last-child td {
    border-bottom: none;
  }

  ${media.mobile} {
    font-size: 12px;

    th,
    td {
      padding: 8px 10px;
    }
  }
`;

interface StockItem {
  nm_id: number;
  article: string;
  warehouse: string;
  quantity: number;
}

interface Props {
  items: StockItem[];
}

export function StocksTable({ items }: Props) {
  return (
    <div>
      <CardTitle>Остатки на складах</CardTitle>
      {items.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', padding: '40px 0', textAlign: 'center' }}>
          Нет данных
        </div>
      ) : (
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <th>Артикул</th>
                <th>Склад</th>
                <th style={{ textAlign: 'right' }}>Кол-во</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={`${item.nm_id}-${item.warehouse}-${i}`}>
                  <td>{item.article || item.nm_id}</td>
                  <td>{item.warehouse}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    {item.quantity.toLocaleString('ru-RU')}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrap>
      )}
    </div>
  );
}
