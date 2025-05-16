const Document = require('../models/doc.model');
const Category = require('../models/category.model');
const mongoose = require('mongoose');
const constantMessage = require("../config/constant");
const docViews = require('../models/document.views.model');
const { docValidationSchema, docUpdateValidation } = require('../utils/validations/joi.validation');

const NO_PREVIEW_S3_IMAGE = process.env.NO_PREVIEW_S3_IMAGE;
const {s3DeleteFunction, s3SingleUploadFunction,s3FileUploadFunction} = require('../helper_functions/helper');


//save document

const saveDocument = async (req, res) => {
    try {
        console.log(req.files);
        console.log(req.body);

        const { error, value } = docValidationSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        let { title, documentNo, category, body } = value;

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ error: "Invalid category ID" });
        }

        let cat = await Category.findOne({ _id: category });

        if (!cat) {
            return res.status(400).json({ error: "Category ID does not exist" });
        }

        let imageUrl = NO_PREVIEW_S3_IMAGE;
        let fileUrl = null;
        
        if (req.files.imageUrl) {
            let imageFile = req.files.imageUrl[0];
            if (imageFile.size > 5 * 1024 * 1024) {
                return res.status(400).json({ error: "Document image size exceeds 5MB limit" });
            }
            let imageBuffer = imageFile.buffer;
            let imageContentType = imageFile.mimetype;
            imageUrl = await s3SingleUploadFunction(imageBuffer, "DocumentPhotos", imageContentType);
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

        const newDocument = new Document({
            title,
            documentNo,
            category,
            body,
            imageUrl,
            fileUrl, 
        });

        await newDocument.save();

        res.status(201).json({ 
            message: "Document saved successfully", 
            document: newDocument 
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: "Unable to save document" });
    }
};


const getDocumentsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ error: "Invalid category ID" });
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 12;
        const titleName = req.query.titleName;
        const skip = (page - 1) * limit;
        const sortData = Number(req.query.sortData) || -1;

        let filter = { category: categoryId };

        if (titleName) {
            filter.title = { $regex: titleName, $options: "i" };
        }

        const documents = await Document
            .find(filter)
            .sort({ createdAt: sortData })
            .skip(skip)
            .limit(limit)
            .populate({ path: "category", select: "name" });

        const totalCount = await Document.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            documents,
            totalCount,
            totalPages,
            currentPage: page,
            limit,
        });

    } catch (error) {
        console.error("Error fetching documents by category:", error);
        res.status(500).json({ error: "Unable to fetch documents" });
    }
};


const getDocumentApi = async (req, res) => {
    try {

        let { page = 1, limit = 12, sortData = -1, titleName, categoryId, documentId } = req.query;

        page = Number(page)
        limit = Number(limit);
        sortData = Number(sortData);

        const skip = (page - 1) * limit;

        let filter = {};
        if (titleName) {
            let tname = { title: { $regex: titleName, $options: "i" } };
            let blname = { body: { $regex: titleName, $options: "i" } };
            filter.$or = [tname, blname];
        }
        if (documentId) {
            filter._id = documentId;
        }

        if (categoryId) {
            filter.category = categoryId;
        }

        const documents = await Document.find(filter)
            .sort({ createdAt: sortData })
            .skip(skip)
            .limit(limit)
            .populate("category");

        const totalCount = await Document.countDocuments(filter);
        const totalPages = Math.ceil(totalCount / limit);

        res.json({
            documents,
            totalCount,
            totalPages,
            currentPage: page,
            limit,
        });

    } catch (error) {
        console.error("Error fetching documents by category:", error);
        res.status(500).json({ error: "Unable to fetch documents" });
    }
};


//function to delete document

const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        if (!documentId) {
            return res.status(400).json({ error: "Document ID is required" });
        }

        const deldoc = await Document.findByIdAndDelete(documentId);
        if (!deldoc) {
            return res.status(404).json({ error: "Document not found" });
        }

        if (deldoc.imageUrl) {
            await s3DeleteFunction(deldoc.imageUrl);
        }

        res.json({ message: "Document deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};



//function to update document
const updateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;


        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ error: "Invalid document ID" });
        }

        const { error, value } = docUpdateValidation.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        let { title, documentNo, category, body } = value;

        console.log(value);

        const document = await Document.findById(documentId);
        if (!document) {
            return res.status(404).json({ error: "Document not found" });
        }

        if(category){
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({ error: "Invalid category ID" });
            }
    
            const existingCategory = await Category.findById(category);
            if (!existingCategory) {
                return res.status(400).json({ error: "Category does not exist" });
            }
        }

        

        let imageUrl = document.imageUrl || NO_PREVIEW_S3_IMAGE;

        if (req.file) {
            console.log("inside");
            let contentType = req.file.mimetype;
            let imageBuffer = req.file.buffer;

            try {
                imageUrl = await s3SingleUploadFunction(imageBuffer, "DocumentPhotos", contentType);
            } catch (s3Error) {
                return res.status(500).json({ error: "Image upload failed" });
            }
        }

        // Delete old image only if a new one is uploaded
        if (req.file && document.imageUrl) {
            await s3DeleteFunction(document.imageUrl);
        }

        const updatedRevisionNo = document.revisionNo + 1;
        const updatedDocument = await Document.findByIdAndUpdate(
            documentId,
            {
                title,
                documentNo,
                category,
                body,
                imageUrl,
                revisionNo: updatedRevisionNo,
            },
            { new: true }
        ).populate("category", "name");


        res.status(200).json({ message: "Document updated successfully", document: updatedDocument });
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).json({ error: "Unable to update document" });
    }
};



//search documents from title and categoryId

const searchDocument = async (req, res) => {
    try {
        const { titleSearch, categoryId } = req.query;

        let filter = {
            title: { $regex: titleSearch, $options: "i" }
        };


        if (categoryId) {
            if (!mongoose.Types.ObjectId.isValid(categoryId)) {
                return res.status(400).json({ success: false, message: "Invalid category ID" });
            }
            filter.category = categoryId;
        }

        const documents = await Document.find(filter)
            .sort({ createdAt: -1 })
            .populate("category", "name");

        return res.status(200).json({ success: true, documents });
    } catch (error) {
        console.error("Error searching documents:", error);
        return res.status(500).json({ success: false, message: "Error searching documents", error: error.message });
    }
};

const logDocumentView = async (req, res) => {
    try {
        const { userId, documentId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(documentId) || !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID or document ID" });
        }


        const findId = await docViews.findOne({ userId, documentId });
        if (!findId) {
            await docViews.create({ userId, documentId });
        }
        res.status(200).json({ message: "document view logged successfully!" });

    }
    catch (error) {
        return res.status(500).json({ error: "Error logging document view" });
    }
};

const getDocumentViews = async (req, res) => {
    try {
        const { documentId } = req.params;

        const views = await docViews.find({ documentId }).populate(
            "userId", 'firstName lastName email createdAt'
        ).lean();

        const formattedViews = views.map(view => ({
            firstName: view.userId.firstName,
            lastName: view.userId.lastName,
            email: view.userId.email,
            registeredOn: view.userId.createdAt.toISOString().split("T")[0],
            viewedOn: view.viewedAt.toISOString().split("T")[0]
        }));

        res.status(200).json({ documentId, viewers: formattedViews });
    } catch (error) {
        console.error("Error fetching document viewers:", error);
        res.status(500).json({ error: "Error fetching document viewers" });
    }
};

//tells number of times a particular user have viewed the doc 
const getUserDocumentViewCount = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID" });
        }

        const viewCount = await docViews.countDocuments({ userId });

        res.status(200).json({ userId, viewCount });
    } catch (error) {
        console.error("Error fetching user document view count:", error);
        res.status(500).json({ error: "Error fetching user document view count" });
    }
};

//tells the count of unique views 
const getDocumentUniqueViewCount = async (req, res) => {
    try {
        const { documentId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(documentId)) {
            return res.status(400).json({ error: "Invalid document ID" });
        }

        const views = await docViews.find({ documentId }).lean();
        const uniqueUserIds = new Set(views.map(view => view.userId.toString()));
        const uniqueViewCount = uniqueUserIds.size;

        res.status(200).json({ documentId, uniqueViewCount });
    } catch (error) {
        console.error("Error fetching unique document view count:", error);
        res.status(500).json({ error: "Error fetching unique document view count" });
    }
};



//get stats of documents
const getDocumentStats = async (req, res) => {
    try {
        const { year } = req.query;

        if(year){
            const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`);

        const filterByYear = { createdAt: { $gte: startDate, $lte: endDate } };

        const DocStat = await Document.find(filterByYear);
        const totalDocument = DocStat.length;

        const documentStats = await Document.aggregate([
            { $match: filterByYear }, // Filter documents by year
            {
                $lookup: {
                    from: "categories",
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


        const DocStat = await Document.find();
        const totalDocument = DocStat.length;

        const documentStats = await Document.aggregate([
            {
                $lookup: {
                    from: "categories",
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
        console.error("Error fetching document statistics:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};



module.exports = {
    saveDocument, getDocumentsByCategory,
    updateDocument, deleteDocument, searchDocument,
    logDocumentView, getDocumentViews, getUserDocumentViewCount,
    getDocumentUniqueViewCount, getDocumentStats, getDocumentApi
};