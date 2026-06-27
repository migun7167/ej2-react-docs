import { Check } from 'lucide-react';
import { STATUS_FLOW } from '../data/mockData';

export default function ProcessTimeline({ currentStatus }) {
  const currentIdx = STATUS_FLOW.findIndex(s => s.id === currentStatus);

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-start gap-0 min-w-max px-2 py-3">
        {STATUS_FLOW.map((step, idx) => {
          const isDone    = idx < currentIdx;
          const isCurrent = idx === currentIdx;
          const isFuture  = idx > currentIdx;

          return (
            <div key={step.id} className="flex items-start">
              {/* Step */}
              <div className="flex flex-col items-center w-16">
                {/* Circle */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-all flex-shrink-0
                    ${isDone    ? 'bg-green-500 shadow-md shadow-green-200' : ''}
                    ${isCurrent ? 'bg-srt-navy ring-4 ring-srt-navy/30 shadow-lg' : ''}
                    ${isFuture  ? 'bg-gray-100' : ''}
                  `}
                >
                  {isDone
                    ? <Check size={16} className="text-white" />
                    : isCurrent
                    ? <span className="text-sm">{step.emoji}</span>
                    : <span className="text-gray-300 text-sm">{step.emoji}</span>
                  }
                </div>
                {/* Label */}
                <div
                  className={`text-[9px] text-center mt-1.5 leading-tight max-w-[56px] font-medium
                    ${isDone    ? 'text-green-600' : ''}
                    ${isCurrent ? 'text-srt-navy font-bold' : ''}
                    ${isFuture  ? 'text-gray-300' : ''}
                  `}
                >
                  {step.label}
                </div>
              </div>

              {/* Connector line (not after last) */}
              {idx < STATUS_FLOW.length - 1 && (
                <div
                  className={`h-[2px] w-4 mt-[18px] flex-shrink-0 rounded-full
                    ${idx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
