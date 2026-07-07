import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface Props {
  label: string;
  hint?: string;
}

export function MetricLabel({ label, hint }: Props) {
  if (!hint) return <>{label}</>;

  return (
    <span>
      {label}{' '}
      <Tooltip title={hint}>
        <QuestionCircleOutlined style={{ fontSize: 12, opacity: 0.55 }} />
      </Tooltip>
    </span>
  );
}
