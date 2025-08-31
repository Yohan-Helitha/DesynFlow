import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({

  request: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'InspectionRequest', 
     required: true 
    },
  investigator: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: 'User', 
     required: true 
    },
  assignedAt: { 
    type: Date, 
    default: Date.now 
    },
  status: { 
    type: String, 
    enum: ['assigned', 'in-progress', 'completed'], 
    default: 'assigned' 
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
