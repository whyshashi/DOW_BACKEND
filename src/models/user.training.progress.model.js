const mongoose = require("mongoose");

const UserTrainingProgressSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "user",
          required: true
         },
    trainingId: {
         type: mongoose.Schema.Types.ObjectId,
          ref: "createNewTraining",
           required: true 
        },
    responses: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: "questionDb" },
        userAnswer: [String]
    }],
    score: { 
        type: Number,
        default: null 
    }, 
    status: {
        type: String,
        enum: ["Viewed", "Attempted"],
        default: "Viewed"
    },
    completedAt: { 
        type: Date
     } 
}, 
{ timestamps: true }
);

const UserTrainingProgress = mongoose.model("UserTrainingProgress", UserTrainingProgressSchema);
module.exports = UserTrainingProgress;
