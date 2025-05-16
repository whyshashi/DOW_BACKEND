const { default: mongoose } = require('mongoose');
const createNewTraining = require('../models/create.new.training.model');
const safetyCategory = require('../models/training.category.model');
const UserTrainingProgress = require('../models/user.training.progress.model');
const { json } = require('express');

const { createTrainingValidation } = require('../utils/validations/joi.validation');
const questionDb = require('../models/questionaire.model');
//save training data

const NO_PREVIEW_S3_IMAGE = process.env.NO_PREVIEW_S3_IMAGE;
const { s3DeleteFunction, s3SingleUploadFunction , s3FileUploadFunction } = require('../helper_functions/helper');



const saveTraining = async (req, res) => {
    const { error, value } = createTrainingValidation.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    let { category, title, body } = value;
    try {
        if (title === null) {
            return res.status(404).json({ message: "The field is mandatory" });
        }
        else {
            let cat = await safetyCategory.findOne({ _id: category });
            if (!cat) {
                return res.status(400).json({ error: "Category ID does not exist" });
            }
            const checkTitle = await createNewTraining.findOne({ title });
            if (checkTitle) {
                return res.status(404).json({ message: "Title already exists please try new title" });
            }
            else {
                




                        let imageUrl = NO_PREVIEW_S3_IMAGE;
                        let fileUrl = null;
                        
                        if (req.files.imageUrl) {
                            let imageFile = req.files.imageUrl[0];
                            if (imageFile.size > 5 * 1024 * 1024) {
                                return res.status(400).json({ error: "Document image size exceeds 5MB limit" });
                            }
                            let imageBuffer = imageFile.buffer;
                            let imageContentType = imageFile.mimetype;
                            imageUrl = await s3SingleUploadFunction(imageBuffer, "TrainingPhotos", imageContentType);
                        }
                
                        
                        if (req.files.file) {
                            let documentFile = req.files.file[0];
                
                            if (documentFile.size > 8 * 1024 * 1024) {
                                return res.status(400).json({ error: "Document file size exceeds 8MB limit" });
                            }
                            let fileBuffer = documentFile.buffer;
                            let fileContentType = documentFile.mimetype;
                            fileUrl = await s3FileUploadFunction(fileBuffer, "DocumentFiles", fileContentType);
                        }

                const trainingDoc = new createNewTraining({
                    category,
                    title,
                    body,
                    imageUrl,
                    fileUrl
                });

                await trainingDoc.save();
                return res.status(201).json({ message: "new training saved", trainingDoc : trainingDoc });
            }
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getTrainingByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        let { page = 1, limit = 12, sortData = -1 } = req.query;
        const skip = (page - 1) * limit;

        sortData = Number(sortData);

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ error: "Invalid category ID" });
        }



        const doc = await createNewTraining.find({ category: categoryId })
            .sort({ createdAt: sortData })
            .skip(skip)
            .limit(Number(limit))
            .populate('category', 'name');

        const totalCount = await createNewTraining.countDocuments({ category: categoryId });

        const totalPages = Math.ceil(totalCount / limit);

        if (!doc.length) {
            return res.status(404).json({ message: "no training modules found!" });
        }

        return res.status(200).json({
            doc,
            totalCount,
            totalPages,
            currentPage: Number(page),
            limit: Number(limit),
        });

    } catch (error) {
        console.error("Error fetching documents by category:", error);
        res.status(500).json({ error: "Unable to fetch safety training documents" });
    }
};


//view all documents in the training module
const getAllTrainingDoc = async (req, res) => {

    try {

        let { page = 1, limit = 12, sortData = -1, searchTitle, categoryId } = req.query;
        const skip = (page - 1) * limit;

        sortData = Number(sortData);

        let filter = {};

        if (categoryId) {
            filter.category = categoryId;
        }

        if (searchTitle) {
            filter.title = { $regex: searchTitle, $options: "i" }
        }

        const checkTitle = await createNewTraining.find(filter)
            .sort({ createdAt: sortData })
            .skip(skip)
            .limit(Number(limit)).populate("category", "name");

        const totalCount = await createNewTraining.countDocuments(filter);

        const totalPages = Math.ceil(totalCount / limit);

        if (!checkTitle) {
            return res.status(404).json({ message: "documents not found" });
        }
        return res.status(200).json({
            checkTitle,
            totalCount,
            totalPages,
            currentPage: Number(page),
            limit: Number(limit),
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

//view training data of particular training document

const getTrainingDoc = async (req, res) => {

    try {
        const { docId } = req.params;
        console.log(docId);
        const getDoc = await createNewTraining.findById(docId);
        if (!getDoc) {
            return res.status(400).json({ message: "document not found" });
        }
        else {
            return res.status(200).json({
                message: "Document found",
                document: getDoc
            })

        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

}



//this will update the document
const updateTrainingDoc = async (req, res) => {
    try {
        const { docId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(docId)) {
            return res.status(400).json({ error: "Invalid document ID" });
        }

        const { error, value } = createTrainingValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        let { category, title, body, imageUrl } = value;

        const getDoc = await createNewTraining.findById(docId);
        if (!getDoc) {
            return res.status(204).json({ message: "Document not found" });
        }

        let categoryId = category;

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ error: "Invalid category ID" });
        }
        const existingCategory = await safetyCategory.findOne({ _id: categoryId });
        if (!existingCategory) {
            return res.status(400).json({ error: "Category does not exist" });
        }

        const newdoc = await createNewTraining.findByIdAndUpdate(
            docId,
            { category, title, body, imageUrl },
            { new: true, runValidators: true }
        ).populate("category", "name");
        return res.status(200).json({
            message: "document updated",
            document: newdoc
        });

    }
    catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

// this will delete the document->
const deleteTrainingDoc = async (req, res) => {
    try {
        const { docId } = req.params;
        if (!docId) {
            return res.status(400).json({ error: "Document ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(docId)) {
            return res.status(400).json({ error: "Invalid document ID" });
        }

        const doc = await createNewTraining.findById(docId);
        if (!doc) {
            return res.status(404).json({ message: "document not found " });
        }
        const quesArray = doc.questionId;
        if (quesArray && quesArray.length > 0) {
            await questionDb.deleteMany({ _id: { $in: quesArray } });
        }
        const cnt = await UserTrainingProgress.countDocuments({ trainingId: docId });
        if (cnt > 0) {
            await UserTrainingProgress.deleteMany({ trainingId: docId });
        }
        let deldoc =  await createNewTraining.findByIdAndDelete(docId);
        if (deldoc.imageUrl) {
            await s3DeleteFunction(deldoc.imageUrl);
        }


        return res.status(200).json({ message: "document deleted " });

    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};


//get stats of training
const getTrainingStats = async (req, res) => {
    try {
        const { year } = req.query;

       
        if(year){
            const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        const filterByYear = { createdAt: { $gte: startDate, $lte: endDate } };

        const DocStat = await createNewTraining.find(filterByYear);
        const totalDocument = DocStat.length;

        const documentStats = await createNewTraining.aggregate([
            { $match: filterByYear }, // Filter by year
            {
                $lookup: {
                    from: "safetycategories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$categoryDetails.name",
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            totalDocument,
            documentStats
        });
        }
        const DocStat = await createNewTraining.find();
        const totalDocument = DocStat.length;

        const documentStats = await createNewTraining.aggregate([
            {
                $lookup: {
                    from: "safetycategories",
                    localField: "category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$categoryDetails.name",
                    count: { $sum: 1 }
                }
            }
        ]);


        return res.status(200).json({
            totalDocument,
            documentStats
        });



        

    } catch (error) {
        console.error("Error fetching training statistics:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



module.exports = {
    saveTraining, getAllTrainingDoc, getTrainingDoc,
    getTrainingByCategory, deleteTrainingDoc, updateTrainingDoc, getTrainingStats
};


