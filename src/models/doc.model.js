const mongoose = require('mongoose');



const DocumentSchema = new mongoose.Schema({

  title: { type: String, required: true },
  documentNo: { type: String, required: true},
  revisionNo:{type:Number , default : 1},
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  body: { type: String, required: true },
  imageUrl:{ type: String },
  fileUrl : {type: String}
  
}, 
{
    timestamps: true, 
    collection: 'documents' 
}
);



module.exports = mongoose.model("Document", DocumentSchema);
