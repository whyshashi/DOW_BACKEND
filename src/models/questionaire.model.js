const mongoose=require('mongoose');
const {questionTypes,roles}=require('../config/constant');
const { number } = require('joi');


const questionaire=new mongoose.Schema({
    questionType: {
        type: Number,
        enum: [1,2,3], // 1 =Open Question,2 = MCQ,3 = single ans
        required: true
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: [String], // Explicit array of strings
        required: true,
    },
    options: {
        // needs to be sent in the string only 
        type: [String],
        required: function () {
           return this.questionType === 2 || this.questionType === 3;
                }
    },
    createdBy:{
        type:Number,
        enum:[1,2,3],   // 1 = Staff, 2 = Auditors, 3 = Super Admin
        default:3,
        required:true
    }
});

const questionDb=mongoose.model('questionDb',questionaire);
module.exports=questionDb;





