import mongoose from "mongoose";
const { Schema } = mongoose;

const ProjectSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, required: true, auto: true },

    projectName: { type: String, required: true },

    // Link to inspection (every project comes from one inspection request)
    inspectionId: {
      type: Schema.Types.ObjectId,
      ref: "InspectionRequest",
      unique: true,
      sparse: true,
    },

    //Project manager
    projectManagerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    //Client who owns this project
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    //Assigned Team
    assignedTeamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },

    //Status tracking
    status: {
      type: String,
      enum: ["On Hold", "Active", "In Progress", "Completed", "Cancelled"],
      index: true,
      default: "Active",
    },

    //Progress tracking (%)
    progress: { type: Number, default: 0 },

    // Final design upload (3D model link, pdf, etc.)
    finalDesign3DUrl: { type: String },

  //Restrict who can view design
  designAccessRestriction: { type: Boolean, default: false },

  //Indicates if an estimate has been created for this project
  estimateCreated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", ProjectSchema);
