import styled from 'styled-components';
import { PageScroll } from '@/components/layout/Layout.styles';
import { media } from '@/styles/breakpoints';

export const DashboardRoot = styled(PageScroll)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DashboardSection = styled.section`
  scroll-margin-top: 120px;

  ${media.mobile} {
    scroll-margin-top: 100px;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;

  h2 {
    font-size: 18px;
    font-weight: 600;
  }

  ${media.mobile} {
    h2 {
      font-size: 16px;
    }
  }
`;

export const Card = styled.section`
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
  border-radius: 24px;
  box-shadow: var(--shadow);
  margin-bottom: 18px;
  padding: 24px;

  ${media.mobile} {
    border-radius: 18px;
    padding: 16px;
    margin-bottom: 14px;
  }
`;

export const HeroCard = styled(Card)`
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: stretch;
  background:
    linear-gradient(135deg, rgba(124, 92, 252, 0.14), rgba(56, 189, 248, 0.1)), var(--color-bg-card);

  ${media.mobile} {
    flex-direction: column;
    gap: 16px;
  }
`;

export const Eyebrow = styled.p`
  margin: 0 0 8px;
  color: var(--color-primary);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(24px, 4vw, 40px);
  line-height: 1.1;
`;

export const HeroSubtitle = styled.p`
  max-width: 760px;
  color: var(--color-text-muted);
  font-size: 15px;
  margin-top: 10px;
  line-height: 1.5;

  ${media.mobile} {
    font-size: 14px;
  }
`;

export const HeroKpis = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 12px;
  min-width: 280px;

  ${media.mobile} {
    min-width: 0;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

export const KpiBox = styled.div`
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.03);

  span {
    display: block;
    color: var(--color-text-muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  strong {
    display: block;
    margin-top: 6px;
    font-size: 22px;
    color: var(--color-text);
  }

  ${media.mobile} {
    padding: 12px;

    strong {
      font-size: 18px;
    }
  }
`;

export const StickyFiltersShell = styled.div`
  position: sticky;
  top: 0;
  z-index: 40;
  margin-bottom: 18px;
  padding-bottom: 8px;
  background: var(--color-bg);
`;

export const FiltersPanel = styled(Card)`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 0;
  box-shadow:
    var(--shadow),
    0 8px 32px rgba(0, 0, 0, 0.25);

  ${media.mobile} {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const ToolbarTitle = styled.h2`
  grid-column: 1 / -1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;

  ${media.mobile} {
    font-size: 16px;
  }
`;

export const FiltersToolbarFooter = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 2px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);

  ${media.mobile} {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  .pagination-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .page-num {
    font-size: 13px;
    color: var(--color-text-muted);
    min-width: 48px;
    text-align: center;
  }

  button {
    min-height: 34px !important;
    padding: 6px 10px !important;
    font-size: 13px !important;
  }

  ${media.mobile} {
    justify-content: space-between;
    width: 100%;

    .pagination-actions {
      flex: 1;
      justify-content: flex-end;
    }
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;

  select,
  input {
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    color: var(--color-text);
    font-size: 14px;
    text-transform: none;
    letter-spacing: normal;
    min-height: 44px;
  }
`;

export const FilterResetRow = styled.div`
  grid-column: 1 / -1;
`;

export const FilterResetButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
  font-size: 13px;

  &:hover {
    color: var(--color-text);
  }
`;

export const BlocksGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const CategoryCardButton = styled.button`
  width: 100%;
  text-align: left;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  background: var(--color-bg-secondary);
  padding: 0;
  cursor: pointer;
  color: var(--color-text);
  font: inherit;
  transition:
    border-color 0.15s,
    transform 0.15s;

  &:hover {
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }
`;

export const CategoryCard = styled.div`
  padding: 16px 18px;
`;

export const CategoryCardTitle = styled.div`
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 6px;
  color: var(--color-text);
`;

export const CategoryCardMeta = styled.div`
  font-size: 13px;
  color: var(--color-text-muted);
  line-height: 1.4;
`;

export const CategoriesStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const GlueBlockCard = styled.article`
  border: 1px solid var(--color-border);
  border-radius: 22px;
  background: var(--color-bg-secondary);
  overflow: hidden;

  ${media.mobile} {
    border-radius: 16px;
  }
`;

export const GlueHead = styled.div`
  display: grid;
  grid-template-columns: minmax(200px, 1fr) repeat(5, minmax(72px, auto));
  gap: 12px;
  align-items: center;
  padding: 16px 18px;
  background: linear-gradient(90deg, rgba(124, 92, 252, 0.12), rgba(56, 189, 248, 0.08));
  border-bottom: 1px solid var(--color-border);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

export const GlueTitle = styled.div`
  strong {
    display: block;
    font-size: 17px;
    line-height: 1.3;
  }

  span {
    display: block;
    color: var(--color-text-muted);
    font-size: 13px;
    margin-top: 4px;
    line-height: 1.4;
  }

  ${media.mobile} {
    strong {
      font-size: 15px;
    }

    span {
      font-size: 12px;
    }
  }
`;

export const GlueMetrics = styled.div`
  display: contents;

  @media (max-width: 900px) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const Metric = styled.div`
  border-left: 1px solid var(--color-border);
  padding-left: 12px;

  span {
    display: block;
    color: var(--color-text-muted);
    font-size: 10px;
    text-transform: uppercase;
  }

  strong {
    font-size: 16px;
  }

  @media (max-width: 900px) {
    border-left: 0;
    border: 1px solid var(--color-border);
    border-radius: 10px;
    padding: 8px 10px;
    background: rgba(0, 0, 0, 0.15);
  }
`;

export const ProductsRow = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 14px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px 18px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--color-primary) var(--color-bg);

  &::-webkit-scrollbar {
    height: 10px;
  }

  &::-webkit-scrollbar-track {
    background: var(--color-bg);
    border-radius: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: var(--color-primary);
    border-radius: 5px;
    border: 2px solid var(--color-bg);
  }

  ${media.mobile} {
    gap: 10px;
    padding: 12px;
  }
`;

export const ScrollHint = styled.div`
  padding: 0 18px 10px;
  font-size: 11px;
  color: var(--color-text-muted);
  text-align: right;

  ${media.mobile} {
    padding: 0 12px 8px;
    text-align: center;
  }
`;

export const ProductCardEl = styled.article`
  flex: 0 0 auto;
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  scroll-snap-align: start;
  border: 1px solid var(--color-border);
  border-radius: 18px;
  background: var(--color-bg-card);
  overflow: hidden;

  ${media.mobile} {
    width: 168px;
    min-width: 168px;
    max-width: 168px;
    border-radius: 14px;
  }
`;

export const PhotoWrap = styled.div`
  aspect-ratio: 3 / 4;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const NoPhoto = styled.span`
  color: #666;
  font-size: 12px;
`;

export const ProductBody = styled.div`
  padding: 12px;
  min-width: 0;

  ${media.mobile} {
    padding: 10px;
  }
`;

export const ProductTitle = styled.a`
  display: block;
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 4px;
  color: var(--color-accent);
  word-break: break-word;

  &:hover {
    text-decoration: underline;
  }
`;

export const ProductMeta = styled.div`
  color: var(--color-text-muted);
  font-size: 12px;
  margin-bottom: 10px;
  word-break: break-word;
`;

export const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
`;

export const Chip = styled.span`
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 11px;
  color: var(--color-text-muted);
`;

export const ProductMetrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  div span {
    display: block;
    font-size: 10px;
    color: var(--color-text-muted);
    text-transform: uppercase;
  }

  div strong {
    font-size: 14px;
  }
`;

export const PageSizeField = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);

  select {
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    color: var(--color-text);
    min-height: 36px;
  }
`;

export const PageInfo = styled.span`
  font-size: 12px;
  color: var(--color-text-muted);
  white-space: nowrap;
`;

export const FetchingHint = styled.p`
  color: var(--color-text-muted);
  font-size: 13px;
  margin: 0 0 8px;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: var(--color-text-muted);
  border: 1px dashed var(--color-border);
  border-radius: 16px;
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 0;
  color: var(--color-text-muted);
`;

export const Skeleton = styled.div<{ $h?: number }>`
  height: ${({ $h }) => $h ?? 80}px;
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    var(--color-bg-card) 0%,
    var(--color-border) 50%,
    var(--color-bg-card) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.2s ease-in-out infinite;

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export const ErrorMsg = styled.div`
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid var(--color-danger);
  color: var(--color-danger);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

export const SuccessMsg = styled.div`
  background: rgba(52, 211, 153, 0.1);
  border: 1px solid var(--color-success);
  color: var(--color-success);
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
`;

export const DropZone = styled.label<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 200px;
  border: 2px dashed ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-border)')};
  border-radius: 20px;
  padding: 32px;
  cursor: pointer;
  background: ${({ $active }) =>
    $active ? 'rgba(124, 92, 252, 0.08)' : 'var(--color-bg-secondary)'};
  transition:
    border-color 0.15s,
    background 0.15s;
  text-align: center;

  input {
    display: none;
  }

  strong {
    font-size: 18px;
  }

  span {
    color: var(--color-text-muted);
    font-size: 14px;
    max-width: 420px;
  }

  ${media.mobile} {
    min-height: 160px;
    padding: 24px 16px;
  }
`;

export const ImportActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;

  ${media.mobile} {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;
