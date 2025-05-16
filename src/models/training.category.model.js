const mongoose = require('mongoose');

  
  const categorySchema = new mongoose.Schema({
    name: { type: String, 
      required: true,
       unique: true,
        trim: true ,
         lowercase: true}
  });

const safetyCategory = mongoose.model("safetyCategory", categorySchema);
module.exports = safetyCategory;

    
  