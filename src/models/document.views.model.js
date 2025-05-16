const { required, date } = require("joi");
const mongoose = require("mongoose");

const documentViews=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    documentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Document",
        required:true
    },
    viewedAt:{
        type:Date,
        default:Date.now
    }

}); 

const docViews=mongoose.model("docViews",documentViews);
module.exports=docViews;