import React from "react";

export default function TeamManagement() {
  const teams = [
    {
      teamName: "Interior Design Team A",
      members: [
        { name: "Alice", role: "Interior Designer" },
        { name: "Ben", role: "3D Visualizer" },
        { name: "Clara", role: "Procurement Coordinator" },
        { name: "David", role: "Site Supervisor" },
        { name: "Ella", role: "Quality & Cost Controller" },
      ],
    },
    {
      teamName: "Interior Design Team B",
      members: [
        { name: "Sam", role: "Interior Designer" },
        { name: "Ivy", role: "3D Visualizer" },
        { name: "Leo", role: "Procurement Coordinator" },
        { name: "Nora", role: "Site Supervisor" },
        { name: "Victor", role: "Quality & Cost Controller" },
      ],
    },
  ];

  return (
    <div className="bg-cream-primary min-h-screen p-8">
      <h2 className="text-2xl font-bold text-brown-primary mb-6">
        Team Management
      </h2>

      {/* Current Teams */}
      <div className="space-y-6 mb-8">
        {teams.map((team, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-brown-primary">
                {team.teamName}
              </h3>
              <button className="px-3 py-1 bg-green-primary text-white rounded hover:bg-opacity-90">
                View Details
              </button>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {team.members.map((m, j) => (
                <li key={j} className="bg-cream-light p-3 rounded">
                  <span className="font-semibold text-brown-primary">
                    {m.name}
                  </span>{" "}
                  <span className="text-gray-600 text-sm">({m.role})</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Create New Team */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-brown-primary mb-4">
          Create a New Team
        </h3>
        <form className="space-y-4">
          <input
            type="text"
            placeholder="Team Name"
            className="w-full border border-gray-300 rounded p-2"
          />

          {/* Assign Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Interior Designer",
              "3D Visualizer",
              "Procurement Coordinator",
              "Site Supervisor",
              "Quality & Cost Controller",
            ].map((role, i) => (
              <div key={i}>
                <label className="block text-sm font-semibold text-brown-primary mb-1">
                  {role}
                </label>
                <input
                  type="text"
                  placeholder={`Assign ${role}`}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-brown-primary text-white rounded hover:bg-opacity-90"
          >
            + Create Team
          </button>
        </form>
      </div>
    </div>
  );
}
