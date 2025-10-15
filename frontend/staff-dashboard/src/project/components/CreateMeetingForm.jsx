import React, { useState } from 'react';

export default function CreateMeetingForm({ 
  isOpen, 
  onClose, 
  onMeetingCreated, 
  project, 
  editMeeting = null 
}) {
  const [form, setForm] = useState({
    channel: editMeeting?.channel || '',
    scheduledAt: editMeeting?.scheduledAt 
      ? new Date(editMeeting.scheduledAt).toISOString().slice(0, 16)
      : '',
    link: editMeeting?.link || '',
    notes: editMeeting?.notes || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEdit = !!editMeeting;
  const showLinkField = form.channel === 'Zoom' || form.channel === 'Teams';

  // Function to validate meeting links
  const validateMeetingLink = (channel, link) => {
    if (!showLinkField || !link) return true; // No validation needed if no link required
    
    try {
      const url = new URL(link);
      const hostname = url.hostname.toLowerCase();
      
      if (channel === 'Zoom') {
        // Zoom meeting URLs should be exactly zoom.us/zoom.com or proper subdomains
        return hostname === 'zoom.us' || hostname === 'zoom.com' ||
               hostname.endsWith('.zoom.us') || hostname.endsWith('.zoom.com');
      } else if (channel === 'Teams') {
        // Teams meeting URLs should be exactly teams.microsoft.com or proper subdomains
        return hostname === 'teams.microsoft.com' || hostname === 'teams.live.com' ||
               hostname.endsWith('.teams.microsoft.com') || hostname.endsWith('.teams.live.com');
      }
      
      return false;
    } catch (error) {
      // Invalid URL format
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!form.channel || !form.scheduledAt) {
      setError('Channel and scheduled time are required');
      return;
    }

    if (showLinkField && !form.link) {
      setError('Meeting link is required for Zoom and Teams meetings');
      return;
    }

    // Validate meeting link format
    if (showLinkField && form.link && !validateMeetingLink(form.channel, form.link)) {
      if (form.channel === 'Zoom') {
        setError('Please enter a valid Zoom meeting link (should contain zoom.us or zoom.com)');
      } else if (form.channel === 'Teams') {
        setError('Please enter a valid Microsoft Teams meeting link (should contain teams.microsoft.com)');
      }
      return;
    }

    setLoading(true);

    try {
      if (!project || !project._id) {
        throw new Error('Invalid project data - missing project ID');
      }

      const meetingData = {
        projectId: project._id,
        withClientId: project.clientId,
        channel: form.channel,
        scheduledAt: form.scheduledAt,
        notes: form.notes
      };

      // Add link only for Zoom/Teams
      if (showLinkField) {
        meetingData.link = form.link;
      }

      const url = isEdit 
        ? `http://localhost:4000/api/meetings/${editMeeting._id}`
        : 'http://localhost:4000/api/meetings';
      
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save meeting');
      }

      const savedMeeting = await response.json();
      onMeetingCreated(savedMeeting);
      onClose();
      
      // Reset form
      setForm({
        channel: '',
        scheduledAt: '',
        link: '',
        notes: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      channel: '',
      scheduledAt: '',
      link: '',
      notes: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-brown-primary mb-4">
          {isEdit ? 'Edit Meeting' : 'Create New Meeting'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Info (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <div className="bg-gray-100 px-3 py-2 rounded border text-gray-700">
              {project.projectName}
            </div>
          </div>

          {/* Channel Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Channel *
            </label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value, link: '' })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
              required
            >
              <option value="">Select channel...</option>
              <option value="Zoom">Zoom</option>
              <option value="Teams">Microsoft Teams</option>
              <option value="Phone">Phone Call</option>
              <option value="InPerson">In-Person</option>
            </select>
          </div>

          {/* Meeting Link (conditional) */}
          {showLinkField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Link *
              </label>
              <input
                type="url"
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                placeholder={
                  form.channel === 'Zoom' 
                    ? "https://zoom.us/j/... or https://zoom.com/..." 
                    : "https://teams.microsoft.com/..."
                }
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
                required
              />
            </div>
          )}

          {/* Scheduled Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date & Time *
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Meeting agenda, topics to discuss..."
              rows={3}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brown-primary"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-brown-primary text-white px-4 py-2 rounded hover:bg-brown-dark disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : (isEdit ? 'Update Meeting' : 'Create Meeting')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}