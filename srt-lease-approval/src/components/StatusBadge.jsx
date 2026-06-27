import { STATUS_CONFIG } from '../data/mockData';

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`status-badge ${config.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} mr-1.5 inline-block`}></span>
      {config.label}
    </span>
  );
}
