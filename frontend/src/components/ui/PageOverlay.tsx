import type { ReactNode } from 'react';
import { Alert, Spin } from 'antd';
import './page-overlay.scss';

interface Props {
  children: ReactNode;
  className?: string;
  busy?: boolean;
  busyText?: string;
  error?: string | null;
  success?: string | null;
}

export function PageOverlay({
  children,
  className,
  busy = false,
  busyText = 'Обновление…',
  error,
  success,
}: Props) {
  const shellClass = ['page-overlay-shell', className].filter(Boolean).join(' ');

  return (
    <div className={shellClass}>
      {children}

      {busy ? (
        <div className="page-overlay page-overlay--busy" aria-live="polite" aria-busy="true">
          <div className="page-overlay__spin">
            <Spin size="large" tip={busyText} />
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="page-overlay page-overlay--error" role="alert">
          <Alert className="page-overlay__alert" type="error" message={error} showIcon />
        </div>
      ) : null}
      {success ? (
        <div className="page-overlay page-overlay--error" role="status">
          <Alert className="page-overlay__alert" type="success" message={success} showIcon />
        </div>
      ) : null}
    </div>
  );
}
