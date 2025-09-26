// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "./SideBar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("info");
  const [message, setMessage] = useState("");

  const sections = [
    { key: "info", label: "Profile Info" },
    { key: "password", label: "Change Password" },
    { key: "activity", label: "Activity" },
  ];

  // Fetch user data
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:5000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const updatedData = {
        phone: user.phone || "",
        address: user.address || "",
      };

      await axios.patch(
        "http://localhost:5000/api/user/update-profile",
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update profile.");
    }
  };

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="flex gap-6 p-6">
      {/* Sidebar */}
      <Sidebar
        sections={sections}
        activeSection={activeSection}
        onSelect={setActiveSection}
      />

      {/* Main Content */}
      <div className="flex-1 bg-white shadow-md rounded-lg p-6">
        {message && (
          <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">
            {message}
          </div>
        )}

        {activeSection === "info" && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Profile Info</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text"
                  value={user.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={user.address || ""}
                  onChange={(e) => setUser({ ...user, address: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <button
                onClick={handleSaveChanges}
                className="mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeSection === "password" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h2>
            <p className="text-gray-600">Password change form goes here.</p>
          </div>
        )}

        {activeSection === "activity" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Activity</h2>
            <p className="text-gray-600">Recent activity, assignments, and requests go here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
