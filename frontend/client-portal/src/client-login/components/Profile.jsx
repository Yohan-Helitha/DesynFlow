import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./SideBar"; // Import Sidebar - Fixed case sensitivity

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [message, setMessage] = useState("");
  const [inspectionRequests, setInspectionRequests] = useState([]);

  // Simple navigation handler
  const handleCreateInspectionRequest = () => {
    navigate("/inspection-request/new"); // Fixed: Navigate to form page, not dashboard
  };

  // Fetch user profile
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:4000/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch inspection requests
  const fetchInspections = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        "http://localhost:4000/api/inspection/my-requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setInspectionRequests(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchInspections();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const updatedData = {
        phone: user.phone || "",
        address: user.address || "",
      };
      await axios.patch(
        "http://localhost:4000/api/user/update-profile",
        updatedData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to update profile.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (separate file) */}
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {message && (
          <div className="mb-4 p-3 rounded bg-blue-100 text-blue-700">
            {message}
          </div>
        )}

        {/* Recent Activities */}
        {activeSection === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Activities</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                "Inspection Request",
                "Payment Progress",
                "Inspection Progress",
                "Report Progress",
                "Requirements Finalized",
                "3D Planning",
                "Material Finalized",
              ].map((activity, index) => (
                <div key={index} className="bg-white shadow-md p-4 rounded">
                  <h3 className="font-semibold">{activity}</h3>
                  <p className="text-sm text-gray-500">Progress details...</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspection Section */}
        {activeSection === "inspection" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Inspection Requests</h2>
              <button 
                onClick={handleCreateInspectionRequest}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                + Create Inspection Request
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {inspectionRequests.length > 0 ? (
                inspectionRequests.map((req, idx) => (
                  <div key={idx} className="bg-white shadow-md p-4 rounded">
                    <h3 className="font-semibold">Request #{req._id}</h3>
                    <p className="text-sm text-gray-600">Status: {req.status}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p>No past inspection requests.</p>
              )}
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeSection === "profile" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
            <div className="space-y-3 bg-white shadow-md rounded p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={user.phone || ""}
                  onChange={(e) =>
                    setUser({ ...user, phone: e.target.value })
                  }
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  value={user.address || ""}
                  onChange={(e) =>
                    setUser({ ...user, address: e.target.value })
                  }
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

        {/* Project Section */}
        {activeSection === "project" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Project Section</h2>
            <p className="text-gray-600">Project details will go here.</p>
          </div>
        )}

        {/* Warranty Section */}
        {activeSection === "warranty" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Warranty Section</h2>
            <p className="text-gray-600">Warranty details will go here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
