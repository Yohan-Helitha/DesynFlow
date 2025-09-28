import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm p-6 flex items-center justify-between">
      <div className="flex-1 max-w-xl">
        <input
          type="text"
          placeholder="Search projects, teams..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="flex items-center gap-6 ml-6">
        <div className="relative group">
          <div className="cursor-pointer">
            <span className="text-2xl">🔔</span>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </div>

          <div className="absolute top-8 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-10 hidden group-hover:block">
            <div className="p-4 border-b border-gray-200 font-semibold">Notifications</div>
            <ul className="max-h-64 overflow-y-auto">
              {[
                {
                  icon: "https://fonts.gstatic.com/s/i/materialiconsoutlined/error_outline/v16/24px.svg",
                  message: "Project Nova requires approval.",
                  time: "5 min ago",
                  color: "yellow"
                },
                {
                  icon: "https://fonts.gstatic.com/s/i/materialiconsoutlined/check_circle/v16/24px.svg",
                  message: "Project Luna marked as completed.",
                  time: "1 hour ago",
                  color: ""
                },
                {
                  icon: "https://fonts.gstatic.com/s/i/materialiconsoutlined/event/v16/24px.svg",
                  message: "Meeting scheduled for Project Aurora.",
                  time: "Today, 10:00 AM",
                  color: ""
                }
              ].map((notif, idx) => (
                <li key={idx} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      notif.color === 'yellow' ? 'bg-yellow-400' : 'bg-gray-200'
                    }`}>
                      <img src={notif.icon} alt="icon" className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{notif.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{notif.time}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brown-primary text-cream-primary rounded-full flex items-center justify-center font-semibold">
            SR
          </div>
          <div>
            <div className="font-semibold text-gray-900">Sophia Rodriguez</div>
            <div className="text-sm text-gray-500">Project Manager</div>
          </div>
        </div>
      </div>
    </header>
  );
}
