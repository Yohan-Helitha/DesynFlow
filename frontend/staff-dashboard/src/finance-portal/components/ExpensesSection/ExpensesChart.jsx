import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
        setProjects(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load project expenses');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setSelected(projects.find(p => p.projectId === selectedId) || null);
  }, [selectedId, projects]);

  if (loading) return <div>Loading chart...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!projects.length) return <div>No in-progress projects found.</div>;

  return (
    <div className="mb-6">
      <label className="block mb-2 font-medium">Select Project:</label>
      <select
        className="border rounded px-3 py-2 mb-4"
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
      >
        <option value="">-- Select --</option>
        {projects.map(p => (
          <option key={p.projectId} value={p.projectId}>{p.projectName}</option>
        ))}
      </select>
      {selected && (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { name: 'Labor', Expenses: selected.expensesByCategory.Labor, Budget: selected.budgetByCategory.Labor },
            { name: 'Procurement', Expenses: selected.expensesByCategory.Procurement, Budget: selected.budgetByCategory.Procurement },
            { name: 'Transport', Expenses: selected.expensesByCategory.Transport, Budget: selected.budgetByCategory.Transport },
            { name: 'Misc', Expenses: selected.expensesByCategory.Misc, Budget: selected.budgetByCategory.Misc },
          ]}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Expenses" fill="#E57373" />
            <Bar dataKey="Budget" fill="#64B5F6" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
