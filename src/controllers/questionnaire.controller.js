const mongoose = require('mongoose');
const questionDb=require('../models/questionaire.model');
const createNewTraining=require('../models/create.new.training.model');
const{questionnaireValidation}=require('../utils/validations/joi.validation');



const createQues = async (req, res) => {
    try {
        const {docId}=req.params;
        const {questions}=req.body;
        if (!docId) {
            return res.status(400).json({ success: false, message: "Document ID is required" });
        }

        if (!mongoose.Types.ObjectId.isValid(docId)) {
            return res.status(400).json({ success: false, message: "Invalid document ID" });
        }
        
        if(!Array.isArray(questions) || questions.length===0){
            return res.status(404).json({message:"Invalid Format"});
        }
        let newQuestion;
        createdQuestionIds=[];
        for(const questionData of questions){
            const {error,value}=questionnaireValidation.validate(questionData);
            let { questionType, question, answer, options, createdBy } = value;
            if(error){
                return res.status(400).json({error:error.details[0].message});
            }
            if ( !questionType || !question || !answer || !createdBy) {  
                return res.status(400).json({ message: "Missing required fields" });
            }
            if (questionType === 2 || questionType===3) { 
                if (!options || !Array.isArray(options) || options.length === 0) {
                    return res.status(400).json({ message: "Options are required for MCQ " });
                }
            }
             newQuestion = new questionDb({
                questionType,
                question,
                answer,
                options,
                createdBy
            });
    
            // console.log(newQuestion);
            await newQuestion.save();
            createdQuestionIds.push(newQuestion._id);

        }
        
        const updatedTraining = await createNewTraining.findByIdAndUpdate(
            docId,
            { $push: { questionID: { $each: createdQuestionIds } } },
            { new: true }
          );

        if (!updatedTraining) {
            return res.status(404).json({ message: "Training not found" });
        }

        // console.log(updatedTraining);

        return res.status(201).json({ message: "Questions has been saved", questions: createdQuestionIds });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// view questionnaire
const viewQues=async(req,res)=>{
try{
const {questionId}=req.params;
if (questionId) {
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(400).json({ success: false, message: "Invalid question ID" });
    }
}

const question=await questionDb.findById(questionId);
if(!question){
    res.status(404).json({message:"question not found!"});
}
else{
    res.status(200).json({question});
}
}
catch(error){
    res.status(500).json({ message: error.message });
}

};

// const viewAllques=async(req,res)=>{
// try{
//     const {docId}=req.params;
//     if (!docId) {
//         return res.status(400).json({ success: false, message: "Document ID is required" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(docId)) {
//         return res.status(400).json({ success: false, message: "Invalid document ID" });
//     }
//     const document=await createNewTraining.findById(docId);
//     if (!document) {
//         return res.status(404).json({ message: "Training document not found" });
//     }
//     if(document.questionID.length===0){
//         res.status(404).json({message:"No questions are created"});
//     }
//     const allQuestions=[];
//     for(const questions of document.questionID){
//         const question=await questionDb.findById(questions._id).populate('questions._id',"questionType question answer options createdBy");
//         if(question){
//             allQuestions.push(question);
//         }
//     }
//     return res.status(200).json({ message: "All questions retrieved", questions: allQuestions });
// }catch(error){
//     res.status(500).json({ message: error.message });
// }
// };
const viewAllques = async (req, res) => {
    try {
      const { docId } = req.params;
      if (!docId) {
        return res.status(400).json({ success: false, message: "Document ID is required" });
      }
  
      if (!mongoose.Types.ObjectId.isValid(docId)) {
        return res.status(400).json({ success: false, message: "Invalid document ID" });
      }
  
      const document = await createNewTraining.findById(docId);
  
      if (!document) {
        return res.status(404).json({ message: "Training document not found" });
      }
  
      if (document.questionID.length === 0) {
        return res.status(404).json({ message: "No questions are created" });
      }
  
      // Only populate if questionID has elements
      const populatedDocument = await createNewTraining.findById(docId).populate('questionID', "questionType question answer options createdBy");
  
      return res.status(200).json({ message: "All questions retrieved", questions: populatedDocument.questionID });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
module.exports={createQues,viewQues,viewAllques};