import React, { useState, useEffect } from "react";
import { FaClock, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

export default function DashboardOverview() {
  // Project stats
  const [stats, setStats] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
  fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        // Stats
        const active = data.filter(p => p.status === 'Active').length;
        const completed = data.filter(p => p.status === 'Completed').length;
        const pending = data.filter(p => p.status === 'Pending Approval' || p.status === 'Pending').length;
        
        setStats([
          {
            title: "Active Projects",
            value: active,
            icon: <FaClock className="text-brown-primary" />,
            color: "bg-cream-light",
            trend: "+2 from last month",
            trendColor: "text-green-600"
          },
          {
            title: "Completed Projects", 
            value: completed,
            icon: <FaCheckCircle className="text-green-primary" />,
            color: "bg-cream-light",
            trend: "+5 from last month",
            trendColor: "text-green-600"
          },
          {
            title: "Pending Approval",
            value: pending,
            icon: <FaExclamationTriangle className="text-yellow-500" />,
            color: "bg-cream-light",
            trend: "-1 from last month",
            trendColor: "text-red-500"
          }
        ]);

        // Recent projects (sorted by createdAt desc, take top 5)
        const sorted = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentProjects(sorted.slice(0, 5));
        setLoadingProjects(false);

        // Fetch recent tasks for these projects
        Promise.all(
          sorted.slice(0, 5).map(project =>
            fetch(`/api/tasks/project/${project._id}`)
              .then(res => res.json())
              .then(tasks => ({ project, tasks }))
              .catch(() => ({ project, tasks: [] }))
          )
        ).then(results => {
          // Flatten and sort tasks by updatedAt desc, take top 5
          const allTasks = results.flatMap(r => r.tasks.map(t => ({ ...t, projectName: r.project.name })));
          const sortedTasks = allTasks.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
          setRecentTasks(sortedTasks);
        });

        // Fetch recent reports for these projects
        Promise.all(
          sorted.slice(0, 3).map(project =>
            fetch(`/api/reports/project/${project._id}`)
              .then(res => res.json())
              .then(reports => reports.map(r => ({ ...r, projectName: project.projectName })))
              .catch(() => [])
          )
        ).then(results => {
          // Flatten and sort reports by createdAt desc, take top 3
          const allReports = results.flat();
          const sortedReports = allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3);
          setRecentReports(sortedReports);
        });
      })
      .catch(err => {
        setLoadingProjects(false);
        console.log('Error fetching projects:', err);
      });
  }, []);

  // Team data state
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    fetch('/api/teams/populated')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Teams data received:', data);
        setTeams(data);
        setLoadingTeams(false);
      })
      .catch((err) => {
        console.error('Error fetching teams:', err);
        setLoadingTeams(false);
        // Fallback to regular teams endpoint
        fetch('/api/teams')
          .then(res => res.json())
          .then(data => {
            console.log('Fallback teams data:', data);
            setTeams(data);
          })
          .catch(() => setTeams([]));
      });
  }, []);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-cream-light rounded-lg p-6 shadow-sm border border-green-primary">
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
            </div>
            <h3 className="text-brown-primary font-semibold text-lg mb-2">{stat.title}</h3>
            <div className="text-4xl font-bold text-brown-primary mb-2">{stat.value}</div>
            <div className={`text-sm ${stat.trendColor}`}>
              {stat.trend}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Team Performance Section */}
        <div className="bg-cream-light rounded-lg p-6 shadow-sm border border-green-primary">
          <h3 className="text-lg font-semibold text-brown-primary mb-4">Team Performance</h3>
          
          <div className="space-y-4">
            {loadingTeams ? (
              <div className="text-green-primary">Loading teams...</div>
            ) : (
              teams.slice(0, 4).map(team => 
                team.members.slice(0, 1).map(member => {
                  const userName = member.userId?.username || member.name || 'Team Member';
                  const userInitial = userName.charAt(0).toUpperCase();
                  
                  return (
                    <div key={member.userId?._id || member.userId} className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brown-primary text-cream-primary rounded-full flex items-center justify-center font-semibold text-lg">
                        {userInitial}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-brown-primary">{userName}</div>
                        <div className="text-sm text-green-primary">{team.teamName}</div>
                      </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-primary transition-all duration-300"
                          style={{ width: `${member.workload || 85}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-brown-primary">{member.workload || 85}%</span>
                    </div>
                    <div className="text-sm text-green-primary">{Math.floor(Math.random() * 5) + 3} projects</div>
                  </div>
                  );
                })
              )
            )}
          </div>
          
          <button className="mt-4 text-sm text-brown-primary hover:text-green-primary">
            View all team members →
          </button>
        </div>

        {/* Resource Allocation Section (replacing chart with summary) */}
        <div className="bg-cream-light rounded-lg p-6 shadow-sm border border-green-primary">
          <h3 className="text-lg font-semibold text-brown-primary mb-4">Resource Allocation</h3>
          <p className="text-sm text-green-primary mb-4">Budget allocation vs. actual usage</p>
          
          <div className="space-y-4">
            {[
              { category: "Furniture", budget: 60, actual: 45, color: "bg-green-primary" },
              { category: "Fabrics", budget: 30, actual: 28, color: "bg-brown-primary" },
              { category: "Lighting", budget: 25, actual: 20, color: "bg-green-primary" },
              { category: "Decor", budget: 20, actual: 15, color: "bg-brown-primary" },
              { category: "Paint", budget: 15, actual: 12, color: "bg-green-primary" }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded ${item.color}`}></div>
                  <span className="text-brown-primary font-medium">{item.category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-green-primary">
                    ${item.actual}k / ${item.budget}k
                  </div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} transition-all duration-300`}
                      style={{ width: `${(item.actual / item.budget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button className="mt-4 text-sm text-brown-primary hover:text-green-primary">
            View detailed resource report →
          </button>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="bg-cream-light rounded-lg p-6 shadow-sm border border-green-primary mb-6">
        <h3 className="text-lg font-semibold text-brown-primary mb-4">Recent Projects</h3>
        {loadingProjects ? (
          <div className="text-green-primary">Loading projects...</div>
        ) : (
          <ul className="space-y-3">
            {recentProjects.map((project) => (
              <li
                key={project._id}
                className="flex items-center gap-3 p-3 rounded-lg transition-cursor-pointer"
                tabIndex={0}
                title={project.name}
              >
                <span className={`w-3 h-3 rounded-full border border-brown-primary flex-shrink-0 ${
                  project.status === 'Pending' ? 'bg-yellow-400' : project.status === 'Completed' ? 'bg-green-primary' : 'bg-brown-primary'
                } group-hover:scale-110 transition-transform`}></span>
                <span className="flex-1 text-base font-semibold text-brown-primary cursor-pointer transition-cursor-pointer">{project.projectName}</span>
                <span className="text-xs text-green-primary font-bold">{project.status}</span>
                <span className="text-xs text-brown-primary">{new Date(project.startDate).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-cream-light rounded-lg p-6 shadow-sm border border-green-primary">
        <h3 className="text-lg font-semibold text-brown-primary mb-4">Recent Activity (Tasks)</h3>
        {loadingProjects ? (
          <div className="text-green-primary">Loading activity...</div>
        ) : (
          <ul className="space-y-3">
            {recentTasks.length === 0 ? (
              <li className="text-green-primary">No recent tasks found.</li>
            ) : (
              recentTasks.map((task, idx) => (
                <li
                  key={task._id || idx}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors duration-200 cursor-pointer hover:bg-cream-primary group"
                  tabIndex={0}
                  title={task.title || task.name}
                >
                  <span className={`w-3 h-3 rounded-full border border-cream-light flex-shrink-0 ${
                    task.status === 'Pending' ? 'bg-brown-primary' : task.status === 'Completed' ? 'bg-green-primary' : 'bg-brown-primary'
                  } group-hover:scale-110 transition-transform`}></span>
                  <span className="flex-1 text-base font-semibold text-brown-primary group-hover:text-brown-primary-300">{task.title || task.name}</span>
                  <span className="text-xs text-brown-primary font-bold">{task.projectName}</span>
                  <span className="text-xs text-brown-primary">{new Date(task.updatedAt).toLocaleDateString()}</span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </>
  );
}
