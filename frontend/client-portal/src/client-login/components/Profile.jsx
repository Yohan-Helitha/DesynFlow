import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "./SideBar"; // Import Sidebar - Fixed case sensitivity
import WarrantySection from "./warranty/WarrantySection";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [message, setMessage] = useState("");
  const [inspectionRequests, setInspectionRequests] = useState([]);

  // Simple navigation handler
  const handleCreateInspectionRequest = () => {
    navigate("/inspection-request/new");
  };

  // Fetch user profile
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3000/api/user/me", {
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
        "http://localhost:3000/api/inspection-request/client",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInspectionRequests(res.data.requests || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchInspections();
    
    // Check if we should automatically switch to inspection section
    if (window.location.hash === "#inspection") {
      setActiveSection("inspection");
      window.location.hash = ""; // Clear the hash
    }

    // Listen for storage events to refresh inspection requests when returning from form
    const handleStorageChange = (e) => {
      if (e.key === 'inspection-request-submitted') {
        fetchInspections();
        setActiveSection("inspection");
        localStorage.removeItem('inspection-request-submitted');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on component focus
    const handleFocus = () => {
      if (localStorage.getItem('inspection-request-submitted')) {
        fetchInspections();
        setActiveSection("inspection");
        localStorage.removeItem('inspection-request-submitted');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const updatedData = {
        phone: user.phone || "",
        address: user.address || "",
      };
      await axios.patch(
        "http://localhost:3000/api/user/update-profile",
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
    <div className="flex h-screen bg-cream-light">
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSelect={setActiveSection}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Dashboard */}
        {activeSection === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-brown-primary">
              Recent Activities
            </h2>
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
                <div
                  key={index}
                  className="bg-cream-primary shadow-md p-4 rounded border border-brown-primary-300"
                >
                  <h3 className="font-semibold text-brown-primary">{activity}</h3>
                  <p className="text-sm text-brown-secondary">Progress details...</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inspection Section */}
        {activeSection === "inspection" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-brown-primary">
                Inspection Requests
              </h2>
              <button
                onClick={handleCreateInspectionRequest}
                className="bg-brown-primary text-white px-4 py-2 rounded hover:bg-brown-primary-700"
              >
                + Create Inspection Request
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inspectionRequests.length > 0 ? (
                inspectionRequests.map((req, idx) => (
                  <div
                    key={req._id || idx}
                    className="bg-cream-primary shadow-md p-4 rounded-lg border border-brown-primary-300 hover:shadow-lg transition-shadow"
                  >
                    <div className="mb-3">
                      <h3 className="font-semibold text-brown-primary text-lg">
                        {req.client_name || 'Inspection Request'}
                      </h3>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-brown-secondary">
                        <span className="font-medium">Property:</span> {req.propertyLocation_address || 'N/A'}
                      </p>
                      <p className="text-sm text-brown-secondary">
                        <span className="font-medium">City:</span> {req.propertyLocation_city || 'N/A'}
                      </p>
                      <p className="text-sm text-brown-secondary">
                        <span className="font-medium">Type:</span> {req.propertyType || 'N/A'}
                      </p>
                      <p className="text-sm text-brown-secondary">
                        <span className="font-medium">Rooms:</span> {req.number_of_room || 'N/A'} | 
                        <span className="font-medium"> Floors:</span> {req.number_of_floor || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="border-t border-brown-primary-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          req.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          req.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {req.status ? req.status.replace('_', ' ').toUpperCase() : 'PENDING'}
                        </span>
                        <p className="text-xs text-brown-secondary-400">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-brown-secondary">No inspection requests found.</p>
                  <p className="text-sm text-brown-secondary-400 mt-1">Click the "Create Inspection Request" button to submit your first request.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeSection === "profile" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-brown-primary">
              Profile Information
            </h2>
            <div className="space-y-3 bg-cream-primary shadow-md rounded p-6 border border-brown-primary-300">
              <div>
                <label className="block text-sm font-medium text-brown-secondary">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full border border-brown-primary-300 p-2 rounded bg-cream-light cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-secondary">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full border border-brown-primary-300 p-2 rounded bg-cream-light cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-secondary">
                  Phone
                </label>
                <input
                  type="text"
                  value={user.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  className="w-full border border-brown-primary-300 p-2 rounded bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown-secondary">
                  Address
                </label>
                <input
                  type="text"
                  value={user.address || ""}
                  onChange={(e) =>
                    setUser({ ...user, address: e.target.value })
                  }
                  className="w-full border border-brown-primary-300 p-2 rounded bg-white"
                />
              </div>
              <button
                onClick={handleSaveChanges}
                className="mt-3 bg-brown-primary text-white py-2 px-4 rounded hover:bg-brown-primary-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* Project Section */}
        {activeSection === "project" && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-brown-primary">
              Project Section
            </h2>
            <p className="text-brown-secondary">Project details will go here.</p>
          </div>
        )}

        {/* Warranty Section */}
        {activeSection === "warranty" && (
          <WarrantySection />
          <div>
            <h2 className="text-2xl font-bold mb-4 text-brown-primary">
              Warranty Section
            </h2>
            <p className="text-brown-secondary">Warranty details will go here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
