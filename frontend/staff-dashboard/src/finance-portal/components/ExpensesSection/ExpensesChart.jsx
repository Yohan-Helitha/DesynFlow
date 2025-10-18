import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const ExpensesChart = () => {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/finance/in-progress-expenses')
      .then(res => res.json())
      .then(data => {
        console.log('Raw chart data from API:', data); // Debug log
        setProjects(data);
        // Auto-select first project if available
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].projectId);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading chart data:', err);
        setError('Failed to load project expenses');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const foundProject = projects.find(p => p.projectId === selectedId);
    if (foundProject) {
      console.log('Selected project data:', foundProject); // Debug log
    }
    setSelected(foundProject || null);
  }, [selectedId, projects]);

  if (loading) return <div className="text-center py-4 text-[#674636]">Loading chart...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!projects.length) return <div className="text-center py-4 text-[#674636]">No in-progress projects found.</div>;

  // Prepare chart data with validation
  const chartData = selected ? [
    { 
      name: 'Labor', 
      Expenses: Number(selected.expensesByCategory?.Labor) || 0, 
      Budget: Number(selected.budgetByCategory?.Labor) || 0 
    },
    { 
      name: 'Procurement', 
      Expenses: Number(selected.expensesByCategory?.Procurement) || 0, 
      Budget: Number(selected.budgetByCategory?.Procurement) || 0 
    },
    { 
      name: 'Transport', 
      Expenses: Number(selected.expensesByCategory?.Transport) || 0, 
      Budget: Number(selected.budgetByCategory?.Transport) || 0 
    },
    { 
      name: 'Misc', 
      Expenses: Number(selected.expensesByCategory?.Misc) || 0, 
      Budget: Number(selected.budgetByCategory?.Misc) || 0 
    },
  ] : [];

  // Debug log
  if (selected) {
    console.log('Chart data prepared:', chartData);
  }

  // Calculate max value for Y-axis domain
  const maxValue = chartData.reduce((max, item) => {
    const itemMax = Math.max(item.Expenses, item.Budget);
    return Math.max(max, itemMax);
  }, 0);

  // Add some padding to the max value (10% extra)
  const yAxisMax = maxValue * 1.1;

  // Custom tooltip to show formatted values
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-[#AAB396] rounded shadow-lg">
          <p className="font-semibold text-[#674636]">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: LKR {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium text-[#674636]">Select Project:</label>
      <select
        className="border border-[#AAB396] rounded px-3 py-2 mb-4 w-full md:w-auto bg-white text-[#674636] focus:outline-none focus:ring-2 focus:ring-[#674636]"
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
      >
        <option value="">-- Select a project --</option>
        {projects.map(p => (
          <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
        ))}
      </select>
      
      {selected ? (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-[#674636] mb-2">
              {selected.projectName} - Expenses vs Budget by Category
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#AAB396" />
              <XAxis 
                dataKey="name" 
                stroke="#674636"
                style={{ fontSize: '14px', fontWeight: '500' }}
              />
              <YAxis 
                stroke="#674636"
                style={{ fontSize: '12px' }}
                domain={[0, yAxisMax]}
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                  return value.toString();
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              <Bar 
                dataKey="Expenses" 
                fill="#674636" 
                radius={[8, 8, 0, 0]}
                name="Expenses (Actual)"
              />
              <Bar 
                dataKey="Budget" 
                fill="#AAB396" 
                radius={[8, 8, 0, 0]}
                name="Budget (Allocated)"
              />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {chartData.map((item) => {
              const percentage = item.Budget > 0 ? ((item.Expenses / item.Budget) * 100).toFixed(1) : 0;
              const isOverBudget = percentage >= 100;
              const isHighUsage = percentage >= 80 && percentage < 100;
              
              return (
                <div key={item.name} className="bg-white p-3 rounded border border-[#AAB396]">
                  <p className="text-xs text-[#AAB396] font-medium uppercase">{item.name}</p>
                  <p className="text-lg font-bold text-[#674636]">
                    LKR {item.Expenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#AAB396]">
                    of LKR {item.Budget.toLocaleString()}
                  </p>
                  <p className={`text-xs font-semibold mt-1 ${
                    isOverBudget ? 'text-red-600' : 
                    isHighUsage ? 'text-orange-600' : 
                    'text-green-600'
                  }`}>
                    {percentage}% {isOverBudget ? '🔴 Over Budget' : isHighUsage ? '🟡 High' : '🟢 OK'}
                  </p>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-[#AAB396]">
          Please select a project to view expenses chart
        </div>
      )}
    </div>
  );
};
