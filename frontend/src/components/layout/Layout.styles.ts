import styled from 'styled-components';
import { media } from '@/styles/breakpoints';

export const AppShell = styled.div`
  display: flex;
  height: 100dvh;
  max-height: 100dvh;
  overflow: hidden;

  ${media.mobile} {
    flex-direction: column;
  }
`;

export const Sidebar = styled.aside`
  width: 240px;
  height: 100%;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding: 24px 16px;
  flex-shrink: 0;
  overflow: hidden;

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
  min-height: 0;
  height: 100%;
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

export const Content = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const PageScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px 32px;
  -webkit-overflow-scrolling: touch;

  ${media.mobile} {
    padding: 16px;
    padding-bottom: calc(16px + 68px + env(safe-area-inset-bottom, 0px));
  }
`;

export const Button = styled.button<{
  $variant?: 'primary' | 'secondary' | 'danger';
  $fullWidth?: boolean;
}>`
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
