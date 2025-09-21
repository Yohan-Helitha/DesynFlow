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
      className="bg-white rounded-md p-6 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start mb-3">
        <div className="mr-auto">{icon}</div>
        {change && (
          <span
            className={`text-xs font-medium ${
              changeType === 'positive' ? 'text-green-500' : 'text-red-500'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-1">{title}</div>
      {value ? (
        <div className="text-2xl font-bold">${value}</div>
      ) : (
        <div className="text-2xl font-bold">{count}</div>
      )}
    </div>
  );
};
