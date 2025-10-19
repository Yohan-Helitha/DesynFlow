import React, { useEffect, useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const ExpensesChart = () => {
  const [projects, setProjects] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [notifyTarget, setNotifyTarget] = useState('finance-managers'); // finance-managers | project-managers | both
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

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

  

  // Compute risk categories and default message
  const riskInfo = useMemo(() => {
    const categories = chartData.map(item => {
      const percentage = item.Budget > 0 ? (item.Expenses / item.Budget) * 100 : 0;
      return { name: item.name, expenses: item.Expenses, budget: item.Budget, percentage: Number(percentage.toFixed(1)) };
    });
    const risky = categories.filter(c => c.percentage >= 80);
    const over = categories.filter(c => c.percentage >= 100);
    return { categories, risky, over };
  }, [chartData]);

  useEffect(() => {
    if (!selected) return;
    if (riskInfo.risky.length > 0) {
      const lines = riskInfo.risky
        .map(c => `- ${c.name}: ${c.percentage}% (LKR ${c.expenses.toLocaleString()} of LKR ${c.budget.toLocaleString()})`)
        .join('\n');
      const msg = `Budget risk detected for ${selected.projectName} (Project ID: ${selected.projectId}).\nCategories nearing/over budget:\n${lines}`;
      setCustomMessage(msg);
    } else {
      setCustomMessage('');
    }
  }, [selected, riskInfo]);

  const hasRisk = riskInfo.risky.length > 0;

  const openRiskModal = () => {
    setFeedback(null);
    setShowRiskModal(true);
  };

  const sendRiskNotification = async () => {
    if (!selected) return;
    try {
      setSending(true);
      setFeedback(null);
      const res = await fetch('/api/finance-notifications/risk-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selected.projectId,
          projectName: selected.projectName,
          categories: riskInfo.risky,
          message: customMessage || `Budget risk detected for ${selected.projectName}.`,
          notify: notifyTarget,
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed with status ${res.status}`);
      }
      const data = await res.json();
      setFeedback({ type: 'success', text: `Notification sent (${data.count} recipients).` });
      setShowRiskModal(false);
    } catch (e) {
      setFeedback({ type: 'error', text: e.message });
    } finally {
      setSending(false);
    }
  };

  // Early returns AFTER all hooks to keep hook order stable
  if (loading) return <div className="text-center py-4 text-[#674636]">Loading chart...</div>;
  if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
  if (!projects.length) return <div className="text-center py-4 text-[#674636]">No in-progress projects found.</div>;

  return (
  <div className="mb-6 rounded-xl shadow-lg bg-[#FFF8E8] border border-[#F7EED3] p-6">
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
          <div className="mb-4 flex items-start justify-between gap-4 flex-wrap">
            <h3 className="text-xl font-bold text-[#674636] tracking-tight">
              {selected.projectName} <span className="font-normal text-[#AAB396]">- Expenses vs Budget by Category</span>
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openRiskModal}
                disabled={!hasRisk}
                className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${
                  hasRisk
                    ? 'bg-[#674636] text-[#FFF8E8] border-transparent hover:bg-[#AAB396]'
                    : 'bg-[#F7EED3] text-[#AAB396] border-[#AAB396] cursor-not-allowed'
                }`}
                title={hasRisk ? 'Send budget risk notification' : 'No categories at risk'}
              >
                Send Risk Notification
              </button>
            </div>
          </div>
          <div className="rounded-lg bg-[#F7EED3] p-4 border border-[#AAB396]">
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
          </div>
          
          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {chartData.map((item) => {
              const percentage = item.Budget > 0 ? ((item.Expenses / item.Budget) * 100).toFixed(1) : 0;
              const isOverBudget = percentage >= 100;
              const isHighUsage = percentage >= 80 && percentage < 100;
              return (
                <div key={item.name} className="bg-[#FFF8E8] p-4 rounded-xl border border-[#AAB396] shadow-sm flex flex-col items-start">
                  <p className="text-xs text-[#AAB396] font-semibold uppercase mb-1 tracking-wide">{item.name}</p>
                  <p className="text-xl font-bold text-[#674636] mb-1">
                    LKR {item.Expenses.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#AAB396] mb-1">
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

          {/* Risk Modal */}
          {showRiskModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowRiskModal(false)} />
              <div className="relative bg-[#FFF8E8] border border-[#AAB396] rounded-lg shadow-xl w-full max-w-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-[#674636]">Send Budget Risk Notification</h4>
                  <button
                    className="text-[#AAB396] hover:text-[#674636]"
                    onClick={() => setShowRiskModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-[#674636] mb-2">Project: <span className="font-semibold">{selected.projectName}</span></p>
                  <div className="bg-[#F7EED3] rounded p-3 border border-[#AAB396] max-h-32 overflow-auto text-xs text-[#674636] mb-3">
                    {riskInfo.risky.map(c => (
                      <div key={c.name}>
                        {c.name}: {c.percentage}% (LKR {c.expenses.toLocaleString()} of LKR {c.budget.toLocaleString()})
                      </div>
                    ))}
                  </div>
                  <label className="block text-sm font-medium text-[#674636] mb-1">Message</label>
                  <textarea
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent text-[#674636] bg-white"
                    rows={4}
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-[#674636] mb-1">Notify</label>
                  <select
                    className="w-full border border-[#AAB396] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#674636] focus:border-transparent bg-white text-[#674636]"
                    value={notifyTarget}
                    onChange={e => setNotifyTarget(e.target.value)}
                  >
                    <option value="finance-managers">Finance Managers</option>
                    <option value="project-managers">Project Managers</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                {feedback && (
                  <div className={`mb-2 text-sm ${feedback.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
                    {feedback.text}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-[#AAB396] rounded-md text-sm font-medium text-[#674636] hover:bg-[#F7EED3]"
                    onClick={() => setShowRiskModal(false)}
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={sendRiskNotification}
                    disabled={sending}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${sending ? 'bg-[#AAB396] text-[#FFF8E8] opacity-80' : 'bg-[#674636] text-[#FFF8E8] hover:bg-[#AAB396]'} `}
                  >
                    {sending ? 'Sending…' : 'Send Notification'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-[#AAB396]">
          Please select a project to view expenses chart
        </div>
      )}
    </div>
  );
};
