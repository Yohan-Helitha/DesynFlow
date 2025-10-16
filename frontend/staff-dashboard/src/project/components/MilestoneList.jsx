import React from "react";
export default function MilestoneList({ milestones, tasks, projectId }) {
  // Helper function to check if a timeline item is completed (past date)
  const isCompleted = (dateString) => {
    const itemDate = new Date(dateString);
    const today = new Date();
    return itemDate < today;
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  // Filter high priority tasks for this project
  const highPriorityTasks = tasks ? tasks.filter(task => 
    task.priority === 'High' && 
    task.projectId === projectId &&
    task.status !== 'Completed'
  ) : [];

  // Combine milestones and high priority tasks, then sort by date
  const timelineItems = [];
  
  // Add milestones
  if (milestones && milestones.length > 0) {
    milestones.forEach(milestone => {
      timelineItems.push({
        ...milestone,
        type: 'milestone',
        date: milestone.date,
        sortDate: new Date(milestone.date)
      });
    });
  }

  // Add high priority tasks
  highPriorityTasks.forEach(task => {
    timelineItems.push({
      ...task,
      type: 'task',
      name: task.taskName || task.title,
      date: task.dueDate || task.deadline,
      sortDate: new Date(task.dueDate || task.deadline || new Date())
    });
  });

  // Sort all items by date
  timelineItems.sort((a, b) => a.sortDate - b.sortDate);

  if (timelineItems.length === 0) {
    return <div className="text-gray-500">No timeline items found.</div>;
  }
  
  return (
    <ul className="space-y-2">
      {timelineItems.map((item, index) => (
        <li key={item._id || item.name || index} className="bg-white rounded shadow px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.type === 'milestone' ? (
                <span className="text-blue-600">📍</span>
              ) : (
                <span className="text-red-600">⚠️</span>
              )}
              <span className="font-semibold text-brown-primary">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {item.type === 'task' && (
                <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                  High Priority
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded ${
                isCompleted(item.date) ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isCompleted(item.date) ? 'Completed' : 'Upcoming'}
              </span>
            </div>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            <span className="mr-3">📅 {formatDate(item.date)}</span>
            {item.type === 'milestone' ? (
              <span className="text-blue-600 text-xs">Milestone</span>
            ) : (
              <span className="text-red-600 text-xs">Task</span>
            )}
          </div>
          {item.description && (
            <div className="text-xs text-gray-500 mt-1">{item.description}</div>
          )}
        </li>
      ))}
    </ul>
  );
}
