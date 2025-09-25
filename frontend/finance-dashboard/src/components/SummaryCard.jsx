import React from 'react';

export const SummaryCard = ({
  title,
  value,
  icon,
  change,
  changeType = 'positive',
  count,
  onClick,
}) => {
  return (
    <div
      className="bg-[#FFF8E8] rounded-md p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-[#F7EED3]"
      onClick={onClick}
    >
      <div className="flex items-start mb-3">
        <div className="mr-auto">{icon}</div>
        {change && (
          <span
            className={`text-xs font-medium ${
              changeType === 'positive' ? 'text-[#AAB396]' : 'text-[#674636]'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      <div className="text-sm text-[#AAB396] mb-1">{title}</div>
      {value ? (
        <div className="text-2xl font-bold text-[#674636]">${value}</div>
      ) : (
        <div className="text-2xl font-bold text-[#674636]">{count}</div>
      )}
    </div>
  );
};
