import styled from 'styled-components';
import { media } from '@/styles/breakpoints';

export const AppShell = styled.div`
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;

  ${media.mobile} {
    flex-direction: column;
  }
`;

export const Sidebar = styled.aside`
  width: 240px;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  flex-shrink: 0;

  ${media.mobile} {
    display: none;
  }
`;

export const Logo = styled.div`
  font-size: 20px;
  font-weight: 700;
  padding: 0 12px 24px;
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

export const Nav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

export const NavLink = styled.a<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? 'var(--color-text)' : 'var(--color-text-muted)')};
  background: ${({ $active }) => ($active ? 'var(--color-bg-card)' : 'transparent')};
  transition: all 0.15s ease;

  &:hover {
    background: var(--color-bg-card);
    color: var(--color-text);
  }
`;

export const BottomNav = styled.nav`
  display: none;

  ${media.mobile} {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 100;
    background: var(--color-bg-secondary);
    border-top: 1px solid var(--color-border);
    padding: 8px 12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
    gap: 8px;
  }
`;

export const BottomNavItem = styled.a<{ $active?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 8px 4px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? 'var(--color-primary)' : 'var(--color-text-muted)')};
  background: ${({ $active }) => ($active ? 'rgba(124, 92, 252, 0.12)' : 'transparent')};
  transition: all 0.15s ease;
  min-height: 52px;
  -webkit-tap-highlight-color: transparent;

  span:first-child {
    font-size: 20px;
    line-height: 1;
  }
`;

export const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;

  ${media.mobile} {
    padding-bottom: calc(68px + env(safe-area-inset-bottom, 0px));
  }
`;

export const Header = styled.header`
  padding: 20px 32px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--color-bg-secondary);
  flex-shrink: 0;

  ${media.mobile} {
    padding: 14px 16px;
    flex-wrap: wrap;
  }
`;

export const PageTitle = styled.h1`
  font-size: 22px;
  font-weight: 600;
  line-height: 1.3;

  ${media.mobile} {
    font-size: 17px;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 0;

  ${media.mobile} {
    gap: 8px;
    max-width: 100%;
  }
`;

export const Content = styled.div`
  flex: 1;
  padding: 24px 32px;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;

  ${media.mobile} {
    padding: 16px;
  }
`;

export const StatusBadge = styled.span<{ $connected?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ $connected }) =>
    $connected ? 'rgba(52, 211, 153, 0.15)' : 'rgba(248, 113, 113, 0.15)'};
  color: ${({ $connected }) =>
    $connected ? 'var(--color-success)' : 'var(--color-danger)'};
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${media.mobile} {
    max-width: 140px;
    font-size: 11px;
    padding: 4px 10px;
  }

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    flex-shrink: 0;
  }
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $fullWidth?: boolean }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;

  ${media.mobile} {
    min-height: 44px;
    padding: 10px 16px;
  }

  ${({ $fullWidth }) =>
    $fullWidth &&
    `
    width: 100%;
  `}

  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: var(--color-primary);
          color: white;
          &:hover { background: var(--color-primary-hover); }
          &:disabled { opacity: 0.5; cursor: not-allowed; }
        `;
      case 'danger':
        return `
          background: rgba(248, 113, 113, 0.15);
          color: var(--color-danger);
          &:hover { background: rgba(248, 113, 113, 0.25); }
        `;
      default:
        return `
          background: var(--color-bg-card);
          color: var(--color-text);
          border: 1px solid var(--color-border);
          &:hover { background: var(--color-border); }
          &:disabled { opacity: 0.5; cursor: not-allowed; }
        `;
    }
  }}
`;

export const Card = styled.div`
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px;

  ${media.mobile} {
    padding: 16px;
    border-radius: 10px;
  }
`;

export const CardTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-muted);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${media.mobile} {
    font-size: 12px;
    margin-bottom: 12px;
  }
`;

export const Grid = styled.div<{ $cols?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $cols }) => $cols ?? 4}, 1fr);
  gap: 16px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  ${media.mobile} {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  ${media.smallMobile} {
    grid-template-columns: 1fr;
  }
`;

export const WidgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;

  ${media.mobile} {
    gap: 12px;
  }
`;

export const Widget = styled(Card)<{ $colSpan?: number }>`
  grid-column: span ${({ $colSpan }) => $colSpan ?? 6};
  min-width: 0;

  @media (max-width: 1024px) {
    grid-column: span 12;
  }
`;
