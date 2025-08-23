import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(

    {
        projectId: {
            type : mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        title : {type: String, required: true},
        description : {type : String},
        priority : {type : String, enum: ['Low', 'Medium', 'High'], default: 'Medium'},
        weight : {type : Number, required: true}, // percentage weight
        deadline : {type : Date, required: true},
        status : {type : String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started'},
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    {timestamps: true}

);

export const Task = mongoose.model("Task", taskSchema);