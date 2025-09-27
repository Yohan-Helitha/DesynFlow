import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const data = [
  { name: 'Jan', income: 40000, outcome: 30000 },
  { name: 'Feb', income: 30000, outcome: 35000 },
  { name: 'Mar', income: 25000, outcome: 22000 },
  { name: 'Apr', income: 40000, outcome: 30000 },
  { name: 'May', income: 50000, outcome: 35000 },
  { name: 'Jun', income: 25000, outcome: 32000 },
  { name: 'Jul', income: 22000, outcome: 30000 },
  { name: 'Aug', income: 24000, outcome: 32000 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#FFF8E8] p-4 border border-[#AAB396] shadow-md rounded">
        <p className="font-medium text-[#674636]">{`${label} 2020`}</p>
        <p className="text-sm text-[#AAB396]">
          ${payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export const IncomeChart = () => {
  const [year, setYear] = useState('2020');

  return (
    <div className="bg-[#FFF8E8] rounded-md p-6 shadow-sm mt-6 border border-[#F7EED3]">
      <div className="flex items-center justify-between mb-6">
        <div className="text-xl font-semibold text-[#674636]">Analytics</div>

        <div className="flex items-center">
          <div className="flex items-center space-x-4 mr-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#674636] mr-2"></div>
              <span className="text-sm text-[#674636]">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#AAB396] mr-2"></div>
              <span className="text-sm text-[#674636]">Outcome</span>
            </div>
          </div>

          <div className="relative">
            <select
              className="appearance-none bg-[#F7EED3] border border-[#AAB396] rounded px-3 py-1.5 pr-8 text-sm text-[#674636]"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="2020">2020</option>
              <option value="2019">2019</option>
              <option value="2018">2018</option>
            </select>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none text-[#674636]">
              <ChevronDown size={16} />
            </div>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F7EED3" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#674636" />
            <YAxis
              axisLine={false}
              tickLine={false}
              stroke="#674636"
              tickFormatter={(value) => `${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="income" fill="#674636" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outcome" fill="#AAB396" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center mt-4">
        <button className="p-1 rounded-full border border-[#AAB396] text-[#674636]">
          <ChevronLeft size={16} />
        </button>
        <div className="h-1 bg-[#F7EED3] flex-1 mx-4">
          <div className="bg-[#674636] h-full w-1/3"></div>
        </div>
        <button className="p-1 rounded-full border border-[#AAB396] text-[#674636]">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
