const mongoose=require('mongoose');

const {user}=require('./user.model');
const AutoIncrement = require("mongoose-sequence")(mongoose);


const incidentSchema = new mongoose.Schema({

    incidentId: { type: Number, required: true, unique: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    description: { type: String, required: true },

    riskLevel: { type: String,
        enum: ["Moderate","High","Severe"],
        default: "Moderate",
        required: true  
    },
    incidentLocation: { 
        type: String,   
        enum: ["locationA","locationB","locationC"],
        required: true ,
    },

    incidentStatus: {
        type: String,
        enum: ["Pending", "In-Progress", "Closed"], 
        default: "Pending", 
        required: true,
    },

    attachments: [{ type: String  }], 
    actionTaken: { type: String, default: "NA" },
},
{
    timestamps: true, 
    collection: 'incidentReporting' 
}
);


// incidentSchema.plugin(AutoIncrement, { inc_field: "incidentId" });

module.exports = mongoose.model("incidentReporting", incidentSchema);