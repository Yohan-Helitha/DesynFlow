import Meeting from '../model/meeting.model.js';

// Function to validate meeting links
const validateMeetingLink = (channel, link) => {
    if (!link) return false;
    
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

// Create a new meeting
export const createMeeting = async (req, res) => {
    try {
        const { projectId, withClientId, channel, scheduledAt, link, notes } = req.body;

        // Validate required fields
        if (!projectId || !channel || !scheduledAt) {
            return res.status(400).json({ 
                message: 'Project ID, channel, and scheduled time are required' 
            });
        }

        // Validate link for Zoom/Teams
        if ((channel === 'Zoom' || channel === 'Teams') && !link) {
            return res.status(400).json({ 
                message: 'Meeting link is required for Zoom and Teams meetings' 
            });
        }

        // Validate meeting link format for Zoom/Teams
        if (channel === 'Zoom' || channel === 'Teams') {
            const isValidLink = validateMeetingLink(channel, link);
            if (!isValidLink) {
                return res.status(400).json({ 
                    message: channel === 'Zoom' 
                        ? 'Invalid Zoom meeting link. Please provide a valid zoom.us or zoom.com URL'
                        : 'Invalid Teams meeting link. Please provide a valid teams.microsoft.com URL'
                });
            }
        }

        const meetingData = {
            projectId,
            withClientId,
            channel,
            scheduledAt: new Date(scheduledAt),
            notes
        };

        // Add link only for Zoom/Teams
        if (channel === 'Zoom' || channel === 'Teams') {
            meetingData.link = link;
        }

        const newMeeting = new Meeting(meetingData);
        await newMeeting.save();

        // Return the meeting without population for now (User model not available yet)
        res.status(201).json(newMeeting);
    } catch (error) {
        console.error('Meeting creation error:', error);
        res.status(500).json({ message: 'Error creating meeting', error: error.message });
    }
};

// Get all meetings for a project
export const getMeetingsByProject = async (req, res) => {
    try {
        const { projectId } = req.params;

        const meetings = await Meeting.find({ projectId })
            .sort({ scheduledAt: 1 });

        res.json(meetings);
    } catch (error) {
        console.error('Get meetings error:', error);
        res.status(500).json({ message: 'Error fetching meetings', error: error.message });
    }
};

// Get a single meeting by ID
export const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;

        const meeting = await Meeting.findById(id);

        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.json(meeting);
    } catch (error) {
        console.error('Get meeting error:', error);
        res.status(500).json({ message: 'Error fetching meeting', error: error.message });
    }
};

// Update a meeting
export const updateMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const { channel, scheduledAt, link, notes } = req.body;

        const updateData = {
            channel,
            scheduledAt: new Date(scheduledAt),
            notes
        };

        // Validate link for Zoom/Teams
        if ((channel === 'Zoom' || channel === 'Teams') && !link) {
            return res.status(400).json({ 
                message: 'Meeting link is required for Zoom and Teams meetings' 
            });
        }

        // Validate meeting link format for Zoom/Teams
        if (channel === 'Zoom' || channel === 'Teams') {
            const isValidLink = validateMeetingLink(channel, link);
            if (!isValidLink) {
                return res.status(400).json({ 
                    message: channel === 'Zoom' 
                        ? 'Invalid Zoom meeting link. Please provide a valid zoom.us or zoom.com URL'
                        : 'Invalid Teams meeting link. Please provide a valid teams.microsoft.com URL'
                });
            }
        }

        // Add or remove link based on channel
        if (channel === 'Zoom' || channel === 'Teams') {
            updateData.link = link;
        } else {
            updateData.$unset = { link: 1 }; // Remove link for Phone/InPerson
        }

        const updatedMeeting = await Meeting.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedMeeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.json(updatedMeeting);
    } catch (error) {
        console.error('Update meeting error:', error);
        res.status(500).json({ message: 'Error updating meeting', error: error.message });
    }
};

// Delete a meeting
export const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMeeting = await Meeting.findByIdAndDelete(id);

        if (!deletedMeeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }

        res.json({ message: 'Meeting deleted successfully' });
    } catch (error) {
        console.error('Delete meeting error:', error);
        res.status(500).json({ message: 'Error deleting meeting', error: error.message });
    }
};