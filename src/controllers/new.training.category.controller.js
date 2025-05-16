const {safetyCategory,createNewTraining, questionDb} = require('../models/index.model');
const  UserTrainingProgress=require('../models/user.training.progress.model');
const mongoose = require('mongoose');

const {categoryValidationSchema}=require('../utils/validations/joi.validation');

const createCategory = async (req, res) => {
  try {
      const {error,value}=categoryValidationSchema.validate(req.body);
      if(error){
        return res.status(400).json({error:error.details[0].message});
      }
      let { names } = value;

      if (!Array.isArray(names) || names.length === 0) {
          return res.status(400).json({ error: 'An array of category names is required' });
      }

      names = names.map(name => name.trim().toLowerCase()).filter(name => name);

      names = [...new Set(names)]; 

      if (names.length === 0) {
          return res.status(400).json({ error: 'Category names cannot be empty after trimming' });
      }

      const existingCategories = await safetyCategory.find({ name: { $in: names } });
      const existingNames = existingCategories.map(cat => cat.name);

      const newNames = names.filter(name => !existingNames.includes(name));

      if (newNames.length === 0) {
          return res.status(400).json({ error: 'All categories already exist' });
      }

      const newCategories = newNames.map(name => ({ name }));
      const createdCategories = await safetyCategory.insertMany(newCategories);

      res.status(201).json({ 
          message: 'Categories created successfully', 
          categories: createdCategories,
          existing: existingNames
      });

  } catch (error) {
      console.error('Error creating categories:', error);
      res.status(500).json({ error: 'Unable to create categories' });
  }
};


//get all categories

const getAllCategories = async (req, res) => {
  try {
    const categories = await safetyCategory.find();

    if (!categories.length) {
      return res.status(404).json({ message: 'No categories found' });
    }
    else{
      res.status(200).json({ categories });
    }

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Unable to fetch categories' });
  }
};


//check if category exist or not in db
const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.params;

    const category = await safetyCategory.findOne({ name: name.toLowerCase() });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    else{
    res.status(200).json({ category });
    }

  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Unable to fetch category' });
  }
};



const deleteCategory = async (req, res) => {
  try {
      const { categoryId } = req.params; 

      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return res.status(400).json({ error: "Invalid category ID" });
      }


      const category = await safetyCategory.findById(categoryId);
      if (!category) {
          return res.status(404).json({ error: "Category not found" });
      }
      const trainingDocsdelete=await createNewTraining.find({category:categoryId});
      const questionsToBedeleted=[];
      const trainingIdstobeDeleted=trainingDocsdelete.map(training=>{
        if(training.questionId && training.questionId.length >0){
          questionsToBedeleted.push(...training.questionID);
        }
        return training._id;
      })
      if(questionsToBedeleted.length>0){
        await questionDb.deleteMany({_id:{$in:questionsToBedeleted}});
      }
      if(trainingIdstobeDeleted.length>0){
        await  UserTrainingProgress.deleteMany({_id:{$in:trainingIdstobeDeleted}});
      }
      
      await createNewTraining.deleteMany({ category: categoryId });
      await safetyCategory.findByIdAndDelete(categoryId);

      res.status(200).json({ message: "Category and associated documents deleted successfully" });
  } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Unable to delete category" });
  }
};


module.exports={createCategory,getAllCategories,getCategoryByName,deleteCategory};



