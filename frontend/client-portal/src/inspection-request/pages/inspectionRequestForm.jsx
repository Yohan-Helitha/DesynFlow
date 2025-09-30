import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const InspectionRequestForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    client_name: "",
    email: "",
    phone_number: "",
    propertyLocation_address: "",
    propertyLocation_city: "",
    propertyType: "residential",
    number_of_floor: 1,
    number_of_room: 1,
    room_name: [""],
    inspection_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoomChange = (index, value) => {
    const updatedRooms = [...form.room_name];
    updatedRooms[index] = value;
    setForm({ ...form, room_name: updatedRooms });
  };

  const addRoom = () => {
    setForm({ ...form, room_name: [...form.room_name, ""] });
  };

  const removeRoom = (index) => {
    const updatedRooms = form.room_name.filter((_, i) => i !== index);
    setForm({ ...form, room_name: updatedRooms });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch("http://localhost:4000/api/inspection-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Inspection request submitted successfully!");
        // Navigate to dashboard after successful submission
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500); // Show success message for 1.5 seconds before redirecting
      } else {
        setMessage(` ${data.message || "Failed to submit request"}`);
      }
    } catch (error) {
      setMessage(" Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-cream-primary shadow-md p-6 rounded-lg border border-brown-primary-300">
      <h2 className="text-2xl font-bold mb-6 text-brown-primary">Inspection Request Form</h2>
      {message && <p className="mb-4 text-brown-secondary">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info */}
        <div className="bg-cream-light p-6 rounded-lg shadow-sm border border-brown-primary-300">
          <h3 className="text-lg font-semibold mb-4 text-brown-primary">Client Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-brown-secondary">Full Name</label>
              <input
                type="text"
                name="client_name"
                value={form.client_name}
                onChange={handleChange}
                className="w-full border border-brown-primary-300 p-2 rounded bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-brown-secondary">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full border border-brown-primary-300 p-2 rounded bg-white"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-brown-secondary">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                className="w-full border border-brown-primary-300 p-2 rounded bg-white"
                required
              />
            </div>
          </div>
        </div>

        {/* Property Info */}
        <div className="bg-cream-light p-6 rounded-lg shadow-sm border border-brown-primary-300">
          <h3 className="text-lg font-semibold mb-4 text-brown-primary">Property Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-brown-secondary">Address</label>
              <input
                type="text"
                name="propertyLocation_address"
                value={form.propertyLocation_address}
                onChange={handleChange}
                className="w-full border border-brown-primary-300 p-2 rounded bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-brown-secondary">City</label>
              <input
                type="text"
                name="propertyLocation_city"
                value={form.propertyLocation_city}
                onChange={handleChange}
                className="w-full border border-brown-primary-300 p-2 rounded bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-brown-secondary">Property Type</label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                className="w-full border border-brown-primary-300 p-2 rounded bg-white"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Office</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="hotel">Hotel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-brown-secondary">No. of Floors</label>
              <input
                type="number"
                name="number_of_floor"
                min="1"
                value={form.number_of_floor}
                onChange={handleChange}
                className="w-full border border-brown-primary-300 p-2 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-brown-secondary">No. of Rooms</label>
              <input
                type="number"
                name="number_of_room"
                min="1"
                value={form.number_of_room}
                onChange={handleChange}
                className="w-full border border-brown-primary-300 p-2 rounded bg-white"
                required
              />
            </div>
          </div>

          {/* Rooms */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2 text-brown-secondary">
              Room Names (Optional)
            </label>
            {form.room_name.map((room, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={room}
                  onChange={(e) => handleRoomChange(index, e.target.value)}
                  placeholder={`Room ${index + 1}`}
                  className="flex-1 border border-brown-primary-300 p-2 rounded bg-white"
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="px-3 py-1 bg-red-brown text-white rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addRoom}
              className="px-3 py-1 bg-green-secondary text-white rounded"
            >
              + Add Room
            </button>
          </div>

          {/* Inspection Date */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1 text-brown-secondary">Preferred Date</label>
            <input
              type="date"
              name="inspection_date"
              value={form.inspection_date}
              onChange={handleChange}
              className="w-full border border-brown-primary-300 p-2 rounded bg-white"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-primary text-white p-2 rounded hover:bg-soft-green"
        >
          {loading ? "Submitting..." : "Submit Inspection Request"}
        </button>
      </form>
    </div>
  );
};

export default InspectionRequestForm;
