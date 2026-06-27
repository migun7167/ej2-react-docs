import { STATUS_FLOW } from '../data/mockData';

export default function StatusBadge({ status, size = 'md' }) {
  const found = STATUS_FLOW.find(s => s.id === status);
  if (!found) {
    return (
      <span className="badge bg-gray-100 text-gray-500">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        {status || 'ไม่ระบุ'}
      </span>
    );
  }
  return (
    <span className={`badge ${found.color} ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${found.dot}`} />
      {found.label}
    </span>
  );
}
