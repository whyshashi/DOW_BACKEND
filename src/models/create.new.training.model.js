const mongoose=require('mongoose');

const NewTrainingSchema=new mongoose.Schema({
    category:{
      type: mongoose.Schema.Types.ObjectId,
       ref: "safetyCategory",
        required: true 
    },
    // businessEntity:{
    //     type:String,
    //     required:true,
    //     trim:true
    // },
    title:{
        type:String,
        trim:true
    },
    body:{
        type:String,
        trim:true
    },
    imageUrl:{ type: String },
    fileUrl:{ type: String },
    questionID:[{ type: mongoose.Schema.Types.ObjectId, ref: "questionDb" }] 
},{
    timestamps: true,  // Auto-creates `createdAt` & `updatedAt`
});

const createNewTraining=mongoose.model("createNewTraining",NewTrainingSchema);
module.exports=createNewTraining;